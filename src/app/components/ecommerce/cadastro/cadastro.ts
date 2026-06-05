import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { ClienteService } from '../../../services/cliente.service';

function senhaMatchValidator(group: AbstractControl): ValidationErrors | null {
  const senha = group.get('senha')?.value;
  const confirmar = group.get('confirmarSenha')?.value;
  return senha && confirmar && senha !== confirmar ? { senhasNaoConferem: true } : null;
}

@Component({
  selector: 'app-cadastro',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule,
            MatFormFieldModule, MatInputModule, MatIconModule,
            MatDatepickerModule, MatNativeDateModule],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cadastro {
  private readonly fb = inject(FormBuilder);
  private readonly clienteService = inject(ClienteService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  readonly salvando = signal(false);
  readonly mostrarSenha = signal(false);
  readonly mostrarConfirmar = signal(false);

  form: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
    email: ['', [Validators.required, Validators.email]],
    dataNascimento: [null, Validators.required],
    username: ['', [Validators.required, Validators.minLength(3)]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    confirmarSenha: ['', Validators.required],
  }, { validators: senhaMatchValidator });

  onCpfInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 9)      v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{0,3})/, '$1.$2');
    input.value = v;
    this.form.get('cpf')?.setValue(v, { emitEvent: false });
  }

  erro(campo: string): string | null {
    const c = this.form.get(campo);
    if (!c || !c.touched || !c.errors) return null;
    if (c.errors['required']) return 'Campo obrigatório.';
    if (c.errors['minlength']) return `Mínimo ${c.errors['minlength'].requiredLength} caracteres.`;
    if (c.errors['email']) return 'E-mail inválido.';
    if (c.errors['pattern']) return campo === 'cpf' ? 'CPF inválido. Formato: 000.000.000-00.' : 'Formato inválido.';
    return null;
  }

  private formatarData(data: Date | string | null): string {
    if (!data) return '';
    if (data instanceof Date) {
      const y = data.getFullYear();
      const m = String(data.getMonth() + 1).padStart(2, '0');
      const d = String(data.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return String(data);
  }

  salvar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.salvando.set(true);

    const raw = this.form.value;
    const payload: Record<string, unknown> = {
      nome: raw.nome,
      cpf: (raw.cpf as string).replace(/\D/g, ''),
      email: raw.email,
      dataNascimento: this.formatarData(raw.dataNascimento),
      username: raw.username,
      senha: raw.senha,
    };

    console.log('[Cadastro] Enviando payload →', payload);

    this.clienteService.cadastrar(payload).subscribe({
      next: () => {
        this.salvando.set(false);
        this.snack.open('Conta criada com sucesso! Faça login para continuar.', 'OK', { duration: 4000 });
        this.router.navigate(['/login']);
      },
      error: (e) => {
        this.salvando.set(false);
        console.error('[Cadastro] Erro ao cadastrar:', e);
        const msg = e?.error?.message ?? e?.error?.errors?.[0]?.message ?? 'Erro ao criar a conta.';
        this.snack.open(msg, 'OK', { duration: 5000 });
      },
    });
  }
}
