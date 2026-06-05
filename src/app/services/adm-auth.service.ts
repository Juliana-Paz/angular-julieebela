import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdmAuthService {
  private readonly http = inject(HttpClient);
  private readonly api = 'http://localhost:8080/auth';

  getMe(): Observable<{ id: number; nome: string; username: string }> {
    return this.http.get<{ id: number; nome: string; username: string }>(`${this.api}/me`);
  }

  updateMe(dados: { nome: string; username: string; senhaAtual?: string; novaSenha?: string }): Observable<{ id: number; nome: string; username: string }> {
    return this.http.patch<{ id: number; nome: string; username: string }>(`${this.api}/me`, dados);
  }
}
