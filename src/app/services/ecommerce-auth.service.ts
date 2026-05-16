import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, finalize, Observable, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import type { LoginPayload, LoginResponse, Usuario } from '../models';

interface AuthState {
  token: string | null;
  tipo: string | null;
  usuario: Usuario | null;
}

@Injectable({
  providedIn: 'root',
})
export class EcommerceAuthService {
  private readonly httpClient = inject(HttpClient);
  private readonly loginUrl = 'http://localhost:8080/auth/login';
  private readonly meUrl = 'http://localhost:8080/auth/me';
  private readonly storageKey = 'sga-ecommerce-auth';
  // Mantem o estado de autenticacao de forma reativa para os componentes que consomem o servico.
  private readonly stateSignal = signal<AuthState>(this.loadInitialState());
  private usuarioRequest$: Observable<Usuario | null> | null = null;

  constructor() {
    if (this.stateSignal().token) {
      this.ensureUsuarioCarregado().subscribe();
    }
  }

  readonly logado = computed(() => Boolean(this.stateSignal().token));
  readonly usuario = computed(() => this.stateSignal().usuario);
  readonly nomeUsuario = computed(() => this.stateSignal().usuario?.nome ?? null);
  readonly username = computed(() => this.stateSignal().usuario?.username ?? null);
  readonly perfil = computed(() => this.stateSignal().usuario?.perfil.nome ?? null);
  readonly token = computed(() => this.stateSignal().token);
  readonly tipo = computed(() => this.stateSignal().tipo);

  login(login: string, senha: string): Observable<Usuario> {
    const payload: LoginPayload = {
      login: login.trim(),
      senha: senha.trim(),
    };

    return this.httpClient.post<LoginResponse>(this.loginUrl, payload).pipe(
      tap((response) => this.saveCredentials(response)),
      switchMap(() => this.ensureUsuarioCarregado()),
      switchMap((usuario) => (usuario ? of(usuario) : throwError(() => new Error('Usuario nao carregado')))),
      catchError((error) => {
        this.logout();
        return throwError(() => error);
      }),
    );
  }

  ensureUsuarioCarregado(): Observable<Usuario | null> {
    const { token, usuario } = this.stateSignal();

    if (!token) {
      return of(null);
    }

    if (usuario) {
      return of(usuario);
    }

    if (!this.usuarioRequest$) {
      this.usuarioRequest$ = this.buscarUsuarioLogado().pipe(
        catchError(() => {
          this.logout();
          return of(null);
        }),
        finalize(() => {
          this.usuarioRequest$ = null;
        }),
        shareReplay(1),
      );
    }

    return this.usuarioRequest$;
  }

  buscarUsuarioLogado(): Observable<Usuario> {
    return this.httpClient.get<Usuario>(this.meUrl).pipe(
      tap((usuario) => {
        const nextState: AuthState = {
          ...this.stateSignal(),
          usuario,
        };

        this.stateSignal.set(nextState);
        this.save(nextState);
      }),
    );
  }

  logout(): void {
    this.usuarioRequest$ = null;

    const nextState: AuthState = {
      token: null,
      tipo: null,
      usuario: null,
    };

    this.stateSignal.set(nextState);
    this.save(nextState);
  }

  authorizationValue(): string | null {
    const { token, tipo } = this.stateSignal();

    if (!token || !tipo) {
      return null;
    }

    return `${tipo} ${token}`;
  }

  private loadInitialState(): AuthState {
    if (typeof localStorage === 'undefined') {
      return { token: null, tipo: null, usuario: null };
    }

    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return { token: null, tipo: null, usuario: null };
      }

      const parsed = JSON.parse(raw) as Partial<AuthState>;
      return {
        token: typeof parsed.token === 'string' ? parsed.token : null,
        tipo: typeof parsed.tipo === 'string' ? parsed.tipo : null,
        usuario: this.parseUsuario(parsed.usuario),
      };
    } catch {
      return { token: null, tipo: null, usuario: null };
    }
  }

  private saveCredentials(response: LoginResponse): void {
    const nextState: AuthState = {
      ...this.stateSignal(),
      token: response.token,
      tipo: response.tipo,
    };

    this.stateSignal.set(nextState);
    this.save(nextState);
  }

  private parseUsuario(value: Partial<Usuario> | null | undefined): Usuario | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    if (typeof value.id !== 'number' || typeof value.nome !== 'string' || typeof value.username !== 'string') {
      return null;
    }

    if (!value.perfil || typeof value.perfil.id !== 'number' || typeof value.perfil.nome !== 'string') {
      return null;
    }

    return {
      id: value.id,
      nome: value.nome,
      username: value.username,
      perfil: {
        id: value.perfil.id,
        nome: value.perfil.nome,
      },
    };
  }

  private save(state: AuthState): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }
}
