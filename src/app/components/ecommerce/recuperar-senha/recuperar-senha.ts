import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RecuperacaoSenhaService } from '../../../services/recuperacao-senha.service';

type Etapa = 'email' | 'codigo' | 'nova-senha';

@Component({
  selector: 'app-recuperar-senha',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './recuperar-senha.html',
  styleUrl: './recuperar-senha.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecuperarSenha {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(RecuperacaoSenhaService);
  private readonly snack = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly etapa = signal<Etapa>('email');
  readonly carregando = signal(false);

  private tokenTemporario = '';

  hideSenha = true;
  hideConfirmar = true;

  readonly emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly codigoForm = this.fb.group({
    codigo: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  readonly senhaForm = this.fb.group({
    novaSenha: ['', [Validators.required, Validators.minLength(6)]],
    confirmarSenha: ['', [Validators.required]],
  });

  enviarEmail(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    this.carregando.set(true);
    this.service.solicitar(this.emailForm.value.email!).subscribe({
      next: () => {
        this.carregando.set(false);
        this.etapa.set('codigo');
        this.snack.open('Código enviado! Verifique seu e-mail.', 'Fechar', { duration: 4000 });
      },
      error: (err: any) => {
        this.carregando.set(false);
        const msg = err.error?.message ?? 'Erro ao enviar código. Tente novamente.';
        this.snack.open(msg, 'Fechar', { duration: 4000 });
      },
    });
  }

  verificarCodigo(): void {
    if (this.codigoForm.invalid) {
      this.codigoForm.markAllAsTouched();
      return;
    }
    this.carregando.set(true);
    this.service.verificarCodigo(this.codigoForm.value.codigo!).subscribe({
      next: (res) => {
        this.carregando.set(false);
        this.tokenTemporario = res.tokenTemporario;
        this.etapa.set('nova-senha');
      },
      error: (e) => {
        this.carregando.set(false);
        const msg = e.error?.errors?.[0]?.message ?? 'Código inválido ou expirado.';
        this.snack.open(msg, 'Fechar', { duration: 4000 });
      },
    });
  }

  redefinirSenha(): void {
    if (this.senhaForm.invalid) {
      this.senhaForm.markAllAsTouched();
      return;
    }
    const { novaSenha, confirmarSenha } = this.senhaForm.value;
    if (novaSenha !== confirmarSenha) {
      this.snack.open('As senhas não coincidem.', 'Fechar', { duration: 4000 });
      return;
    }
    this.carregando.set(true);
    this.service.redefinirSenha(this.tokenTemporario, novaSenha!).subscribe({
      next: () => {
        this.carregando.set(false);
        this.snack.open('Senha redefinida com sucesso!', 'Fechar', { duration: 4000 });
        this.router.navigate(['/login']);
      },
      error: (e) => {
        this.carregando.set(false);
        const msg = e.error?.errors?.[0]?.message ?? 'Erro ao redefinir senha. Tente novamente.';
        this.snack.open(msg, 'Fechar', { duration: 5000 });
      },
    });
  }
}
