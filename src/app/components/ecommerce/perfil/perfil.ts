import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateMaskDirective } from '../../../directives/date-mask.directive';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import moment from 'moment';
import { ClienteService } from '../../../services/cliente.service';
import { PedidoService } from '../../../services/pedido.service';
import { EcommerceAuthService } from '../../../services/ecommerce-auth.service';
import { Cliente } from '../../../models/cliente.model';
import { Endereco } from '../../../models/endereco.model';
import { Pedido } from '../../../models/pedido.model';

function novaSenhaMatchValidator(group: AbstractControl): ValidationErrors | null {
  const nova = group.get('novaSenha')?.value;
  const confirmar = group.get('confirmarSenha')?.value;
  return nova && confirmar && nova !== confirmar ? { senhasNaoConferem: true } : null;
}

function confirmPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const senha = control.parent?.get('novaSenha')?.value;
  if (!senha || !control.value) return null;
  return control.value !== senha ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, ReactiveFormsModule, RouterLink,
            MatButtonModule, MatCardModule, MatFormFieldModule,
            MatInputModule, MatIconModule, MatTabsModule,
            MatTableModule, MatDividerModule, MatChipsModule,
            MatDatepickerModule, DateMaskDirective, NgxMaskDirective],
  providers: [provideNgxMask()],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Perfil implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clienteService = inject(ClienteService);
  private readonly pedidoService = inject(PedidoService);
  private readonly authService = inject(EcommerceAuthService);
  private readonly snack = inject(MatSnackBar);
  private readonly route = inject(ActivatedRoute);

  readonly cliente = signal<Cliente | null>(null);
  readonly pedidos = signal<Pedido[]>([]);
  readonly loading = signal(true);
  readonly salvandoDados = signal(false);
  readonly salvandoSenha = signal(false);
  readonly mostrarFormEndereco = signal(false);
  readonly tabIndex = signal(0);

  hideSenhaAtual = true;
  hideNovaSenha = true;
  hideConfirmarSenha = true;

  readonly usuario = this.authService.usuario;

  dadosForm!: FormGroup;
  senhaForm!: FormGroup;
  enderecoForm!: FormGroup;

  readonly pedidoColumns = ['id', 'data', 'status', 'total', 'formaPagamento'];

  ngOnInit(): void {
    this.dadosForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      email: ['', [Validators.required, Validators.email]],
      dataNascimento: ['', Validators.required],
    });

    this.senhaForm = this.fb.group({
      senhaAtual: ['', Validators.required],
      novaSenha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', [Validators.required, confirmPasswordValidator]],
    }, { validators: novaSenhaMatchValidator });

    this.senhaForm.get('novaSenha')?.valueChanges.subscribe(() => {
      this.senhaForm.get('confirmarSenha')?.updateValueAndValidity();
    });

    this.enderecoForm = this.fb.group({
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
      logradouro: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      bairro: ['', Validators.required],
      municipio: ['', Validators.required],
      estado: ['', [Validators.required, Validators.maxLength(2)]],
    });

    const aba = Number(this.route.snapshot.queryParamMap.get('aba') ?? 0);
    if (!isNaN(aba) && aba >= 0 && aba <= 3) this.tabIndex.set(aba);

    this.carregarPerfil();
    this.carregarPedidos();
  }

  private formatarCpf(cpf: string): string {
    const d = (cpf ?? '').replace(/\D/g, '').padEnd(11, '0').slice(0, 11);
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  private formatarData(data: any): string {
    if (!data) return '';
    if (typeof data.format === 'function') return data.format('YYYY-MM-DD');
    if (data instanceof Date) {
      const y = data.getFullYear();
      const m = String(data.getMonth() + 1).padStart(2, '0');
      const d = String(data.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return String(data);
  }

  private carregarPerfil(): void {
    this.clienteService.getMeuPerfil().subscribe({
      next: cliente => {
        this.cliente.set(cliente);
        this.dadosForm.patchValue({
          nome: cliente.nome,
          cpf: this.formatarCpf(cliente.cpf ?? ''),
          email: cliente.email,
          dataNascimento: cliente.dataNascimento ? moment(cliente.dataNascimento, 'YYYY-MM-DD') : null,
        });
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); },
    });
  }

  private carregarPedidos(): void {
    this.pedidoService.historico().subscribe({
      next: pedidos => this.pedidos.set(pedidos),
      error: () => {},
    });
  }

  erroDados(campo: string): string | null {
    const c = this.dadosForm.get(campo);
    if (!c || !c.touched || !c.errors) return null;
    if (c.errors['required']) return 'Campo obrigatório.';
    if (c.errors['minlength']) return `Mínimo ${c.errors['minlength'].requiredLength} caracteres.`;
    if (c.errors['email']) return 'E-mail inválido.';
    if (c.errors['pattern']) return 'Formato inválido.';
    return null;
  }

  erroSenha(campo: string): string | null {
    const c = this.senhaForm.get(campo);
    if (!c || !c.touched || !c.errors) return null;
    if (c.errors['required']) return 'Campo obrigatório.';
    if (c.errors['minlength']) return `Mínimo ${c.errors['minlength'].requiredLength} caracteres.`;
    return null;
  }

  erroEndereco(campo: string): string | null {
    const c = this.enderecoForm.get(campo);
    if (!c || !c.touched || !c.errors) return null;
    if (c.errors['required']) return 'Campo obrigatório.';
    if (c.errors['maxlength']) return 'Máximo 2 caracteres.';
    if (c.errors['pattern']) return 'Formato inválido.';
    return null;
  }

  salvarDados(): void {
    if (this.dadosForm.invalid) { this.dadosForm.markAllAsTouched(); return; }
    this.salvandoDados.set(true);
    const raw = this.dadosForm.value;
    const dadosPayload = {
      ...raw,
      cpf: (raw.cpf as string).replace(/\D/g, ''),
      dataNascimento: this.formatarData(raw.dataNascimento),
    };
    this.clienteService.atualizarPerfil(dadosPayload).subscribe({
      next: cliente => {
        this.cliente.set(cliente);
        this.salvandoDados.set(false);
        this.snack.open('Dados atualizados com sucesso!', 'OK', { duration: 3000 });
      },
      error: () => { this.salvandoDados.set(false); this.snack.open('Erro ao atualizar dados.', 'OK', { duration: 3000 }); },
    });
  }

  alterarSenha(): void {
    if (this.senhaForm.invalid) { this.senhaForm.markAllAsTouched(); return; }
    if (this.senhaForm.errors?.['senhasNaoConferem']) {
      this.snack.open('As senhas não conferem.', 'OK', { duration: 3000 }); return;
    }
    this.salvandoSenha.set(true);
    const { senhaAtual, novaSenha } = this.senhaForm.value;
    this.clienteService.alterarSenha({ senhaAtual, novaSenha }).subscribe({
      next: () => {
        this.salvandoSenha.set(false);
        this.senhaForm.reset();
        this.snack.open('Senha alterada com sucesso!', 'OK', { duration: 3000 });
      },
      error: () => { this.salvandoSenha.set(false); this.snack.open('Senha atual incorreta.', 'OK', { duration: 3000 }); },
    });
  }

  get enderecos(): Endereco[] { return this.cliente()?.enderecos ?? []; }

  toggleFormEndereco(): void { this.mostrarFormEndereco.update(v => !v); this.enderecoForm.reset(); }

  salvarEndereco(): void {
    if (this.enderecoForm.invalid) { this.enderecoForm.markAllAsTouched(); return; }
    const novoEnd: Partial<Endereco> = { ...this.enderecoForm.value, principal: false };
    this.clienteService.adicionarEndereco(novoEnd).subscribe({
      next: cliente => {
        this.cliente.set(cliente);
        this.mostrarFormEndereco.set(false);
        this.enderecoForm.reset();
        this.snack.open('Endereço adicionado!', 'OK', { duration: 3000 });
      },
      error: (e) => {
        console.error('[Perfil] Erro ao salvar endereço:', e);
        this.snack.open('Erro ao salvar endereço.', 'OK', { duration: 3000 });
      },
    });
  }

  removerEndereco(index: number): void {
    if (!confirm('Remover este endereço?')) return;
    this.clienteService.removerEndereco(index).subscribe({
      next: cliente => { this.cliente.set(cliente); this.snack.open('Endereço removido.', 'OK', { duration: 2500 }); },
      error: () => { this.snack.open('Erro ao remover endereço.', 'OK', { duration: 3000 }); },
    });
  }

  sairConta(): void { this.authService.logout(); }
}
