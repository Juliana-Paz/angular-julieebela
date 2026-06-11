import { ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RecuperacaoSenhaService } from '../../../services/recuperacao-senha.service';

@Component({
  selector: 'app-recuperar-senha',
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './recuperar-senha.html',
  styleUrl: './recuperar-senha.css',
})
export class RecuperarSenha {
  private readonly service = inject(RecuperacaoSenhaService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('emailInput') emailInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('codigoInput') codigoInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('novaSenhaInput') novaSenhaInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('confirmarSenhaInput') confirmarSenhaInputRef!: ElementRef<HTMLInputElement>;

  passo = 1;
  carregando = false;
  erro = '';

  private _email = '';
  private _token = '';

  get emailExibicao(): string { return this._email; }

  onEmailInput(e: Event): void {
    this._email = (e.target as HTMLInputElement).value.trim();
  }

  solicitarCodigo(): void {
    this.erro = '';
    const email = this._email || this.emailInputRef?.nativeElement?.value?.trim() || '';
    if (!email) { this.erro = 'Informe seu e-mail.'; return; }
    this._email = email;
    this.carregando = true;
    this.cdr.detectChanges();

    this.service.solicitar(email).subscribe({
      next: () => {
        this.passo = 2;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        let mensagem = 'Erro ao enviar código.';
        try {
          const body = typeof err.error === 'string' ? JSON.parse(err.error) : err.error;
          mensagem = body?.message ?? mensagem;
        } catch {}
        this.erro = mensagem;
        this.carregando = false;
        this.cdr.detectChanges();
      },
    });
  }

  verificarCodigo(): void {
    this.erro = '';
    const codigo = this.codigoInputRef?.nativeElement?.value?.trim() || '';
    if (!codigo) { this.erro = 'Informe o código.'; return; }
    this.carregando = true;
    this.cdr.detectChanges();

    this.service.verificarCodigo(codigo).subscribe({
      next: (res) => {
        this._token = res.tokenTemporario;
        this.passo = 3;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.erro = err?.error?.errors?.[0]?.message ?? err?.error?.message ?? 'Código inválido ou expirado.';
        this.carregando = false;
        this.cdr.detectChanges();
      },
    });
  }

  redefinirSenha(): void {
    this.erro = '';
    const novaSenha = this.novaSenhaInputRef?.nativeElement?.value || '';
    const confirmar = this.confirmarSenhaInputRef?.nativeElement?.value || '';
    if (!novaSenha) { this.erro = 'Informe a nova senha.'; return; }
    if (novaSenha.length < 6) { this.erro = 'Mínimo 6 caracteres.'; return; }
    if (novaSenha !== confirmar) { this.erro = 'As senhas não coincidem.'; return; }
    this.carregando = true;
    this.cdr.detectChanges();

    this.service.redefinirSenha(this._token, novaSenha).subscribe({
      next: () => {
        this.carregando = false;
        this.cdr.detectChanges();
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.erro = err?.error?.errors?.[0]?.message ?? err?.error?.message ?? 'Erro ao redefinir senha.';
        this.carregando = false;
        this.cdr.detectChanges();
      },
    });
  }
}
