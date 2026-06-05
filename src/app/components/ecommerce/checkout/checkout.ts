import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClienteService } from '../../../services/cliente.service';
import { PedidoService } from '../../../services/pedido.service';
import { CarrinhoService } from '../../../services/carrinho.service';
import { Endereco } from '../../../models/endereco.model';

interface FormaPagamento { id: number; nome: string; }

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule,
            MatFormFieldModule, MatInputModule, MatRadioModule, MatDividerModule, MatIconModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Checkout implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clienteService = inject(ClienteService);
  private readonly pedidoService = inject(PedidoService);
  private readonly carrinhoService = inject(CarrinhoService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  readonly enderecos = signal<Endereco[]>([]);
  readonly loading = signal(true);
  readonly salvando = signal(false);
  readonly salvandoEndereco = signal(false);
  readonly enderecoSelecionado = signal(0);
  readonly mostrarNovoEndereco = signal(false);

  readonly itens = this.carrinhoService.items;
  readonly valorTotal = this.carrinhoService.valorTotal;
  readonly cupom = this.carrinhoService.cupom;
  readonly desconto = this.carrinhoService.desconto;
  readonly valorTotalFinal = this.carrinhoService.valorTotalFinal;

  readonly formasPagamento: FormaPagamento[] = [
    { id: 1, nome: 'PIX' },
    { id: 2, nome: 'Boleto' },
    { id: 3, nome: 'Cartão de Crédito' },
    { id: 4, nome: 'Cartão de Débito' },
  ];

  form!: FormGroup;
  novoEnderecoForm!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      idFormaPagamento: [1, Validators.required],
    });

    this.novoEnderecoForm = this.fb.group({
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
      logradouro: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      bairro: ['', Validators.required],
      municipio: ['', Validators.required],
      estado: ['', [Validators.required, Validators.maxLength(2)]],
    });

    this.clienteService.getMeuPerfil().subscribe({
      next: cliente => {
        this.enderecos.set(cliente.enderecos ?? []);
        this.loading.set(false);
      },
      error: (e) => {
        console.error('[Checkout] Erro ao carregar perfil:', e);
        this.loading.set(false);
        this.snack.open('Erro ao carregar dados do perfil.', 'OK', { duration: 3000 });
      },
    });
  }

  selecionarEndereco(index: number): void { this.enderecoSelecionado.set(index); }

  toggleNovoEndereco(): void {
    this.mostrarNovoEndereco.update(v => !v);
    if (!this.mostrarNovoEndereco()) this.novoEnderecoForm.reset();
  }

  salvarNovoEndereco(): void {
    if (this.novoEnderecoForm.invalid) { this.novoEnderecoForm.markAllAsTouched(); return; }
    this.salvandoEndereco.set(true);
    const novoEnd: Partial<Endereco> = { ...this.novoEnderecoForm.value, principal: false };

    this.clienteService.adicionarEndereco(novoEnd).subscribe({
      next: cliente => {
        this.enderecos.set(cliente.enderecos ?? []);
        this.enderecoSelecionado.set((cliente.enderecos?.length ?? 1) - 1);
        this.mostrarNovoEndereco.set(false);
        this.novoEnderecoForm.reset();
        this.salvandoEndereco.set(false);
        this.snack.open('Endereço adicionado!', 'OK', { duration: 2500 });
      },
      error: (e) => {
        this.salvandoEndereco.set(false);
        console.error('[Checkout] Erro ao salvar endereço:', e);
        this.snack.open('Erro ao salvar endereço.', 'OK', { duration: 3000 });
      },
    });
  }

  finalizar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.itens().length === 0) { this.snack.open('O carrinho está vazio.', 'OK', { duration: 3000 }); return; }

    const ends = this.enderecos();
    if (this.mostrarNovoEndereco() || ends.length === 0) {
      this.snack.open('Selecione ou adicione um endereço de entrega.', 'OK', { duration: 3000 });
      return;
    }

    const endereco = ends[this.enderecoSelecionado()];
    this.salvando.set(true);
    const cupomAtual = this.cupom();

    const dto = {
      itens: this.itens().map(i => ({ idPijama: i.pijama.id, quantidade: i.quantidade })),
      ...(cupomAtual ? { codigoCupom: cupomAtual.codigo } : {}),
      enderecoEntrega: {
        logradouro: endereco.logradouro,
        numero: endereco.numero,
        complemento: endereco.complemento ?? '',
        bairro: endereco.bairro,
        cep: endereco.cep,
        municipio: endereco.municipio,
        estado: endereco.estado,
        principal: endereco.principal ?? false,
      },
      idFormaPagamento: this.form.value.idFormaPagamento,
    };

    console.log('[Checkout] POST /pedidos →', dto);

    this.pedidoService.criar(dto).subscribe({
      next: pedido => {
        this.carrinhoService.limpar();
        this.salvando.set(false);
        this.router.navigate(['/pedido-confirmado', pedido.id]);
      },
      error: (e) => {
        this.salvando.set(false);
        console.error('[Checkout] Erro ao finalizar pedido:', e);
        const msg = e?.error?.message ?? 'Erro ao finalizar o pedido. Verifique os dados e tente novamente.';
        this.snack.open(msg, 'Fechar', { duration: 5000 });
      },
    });
  }
}
