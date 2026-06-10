import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { EcommerceAuthService } from '../../../services/ecommerce-auth.service';
import { CarrinhoService } from '../../../services/carrinho.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, MatIconModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(EcommerceAuthService);
  private readonly carrinhoService = inject(CarrinhoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly erro = signal('');
  readonly enviando = signal(false);
  hideSenha = true;

  readonly form = this.formBuilder.group({
    login: ['', [Validators.required]],
    senha: ['', [Validators.required]],
  });

  enviar(): void {
    this.erro.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const login = this.form.controls.login.value ?? '';
    const senha = this.form.controls.senha.value ?? '';

    this.enviando.set(true);

    this.authService
      .login(login, senha)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (usuario) => {
          this.carrinhoService.onLogin(usuario.username);
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          if (returnUrl) {
            this.router.navigateByUrl(returnUrl);
            return;
          }
          const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo');
          if (redirectTo) {
            this.router.navigateByUrl('/' + redirectTo);
            return;
          }
          const perfil = this.authService.perfil()?.toLowerCase() ?? '';
          this.router.navigate(perfil === 'adm' ? ['/adm'] : ['/']);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.erro.set('Login ou senha inválidos.');
            return;
          }

          this.erro.set('Não foi possível entrar no momento.');
        },
      });
  }
}
