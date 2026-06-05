import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdmAuthService } from '../../../services/adm-auth.service';
import { EcommerceAuthService } from '../../../services/ecommerce-auth.service';

@Component({
  selector: 'app-adm-perfil',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './adm-perfil.html',
  styleUrl: './adm-perfil.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdmPerfil implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AdmAuthService);
  private readonly authService = inject(EcommerceAuthService);
  private readonly snack = inject(MatSnackBar);

  readonly carregando = signal(false);
  hideSenhaAtual = true;
  hideNovaSenha = true;
  hideConfirmarSenha = true;

  readonly form = this.fb.group({
    nome: ['', Validators.required],
    username: ['', Validators.required],
    senhaAtual: [''],
    novaSenha: ['', Validators.minLength(6)],
    confirmarSenha: [''],
  });

  ngOnInit(): void {
    this.service.getMe().subscribe({
      next: (usuario) => {
        this.form.patchValue({ nome: usuario.nome, username: usuario.username });
      },
      error: () => {
        this.snack.open('Erro ao carregar perfil.', 'Fechar', { duration: 3000 });
      },
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { novaSenha, confirmarSenha, senhaAtual, nome, username } = this.form.value;

    if (novaSenha && novaSenha !== confirmarSenha) {
      this.snack.open('As senhas não coincidem.', 'Fechar', { duration: 3000 });
      return;
    }

    this.carregando.set(true);
    const payload: { nome: string; username: string; senhaAtual?: string; novaSenha?: string } = {
      nome: nome!,
      username: username!,
    };
    if (novaSenha) {
      payload.senhaAtual = senhaAtual ?? '';
      payload.novaSenha = novaSenha;
    }

    this.service.updateMe(payload).subscribe({
      next: () => {
        this.carregando.set(false);
        this.snack.open('Perfil atualizado com sucesso!', 'Fechar', { duration: 3000 });
        this.form.patchValue({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
        // Recarrega dados do usuário no AuthService para atualizar o header
        this.authService.buscarUsuarioLogado().subscribe();
      },
      error: (err: any) => {
        this.carregando.set(false);
        const msg =
          err.error?.errors?.[0]?.message ??
          err.error?.message ??
          'Erro ao salvar. Tente novamente.';
        this.snack.open(msg, 'Fechar', { duration: 4000 });
      },
    });
  }
}
