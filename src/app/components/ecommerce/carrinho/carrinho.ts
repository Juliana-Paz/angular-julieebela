import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { CarrinhoService } from '../../../services/carrinho.service';
import { CupomService } from '../../../services/cupom.service';
import { EcommerceAuthService } from '../../../services/ecommerce-auth.service';
import { PijamaEcommerce } from '../ecommerce.types';

@Component({
  selector: 'app-carrinho',
  imports: [CommonModule, ReactiveFormsModule, RouterLink,
            MatButtonModule, MatCardModule, MatIconModule,
            MatInputModule, MatFormFieldModule, MatDividerModule],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Carrinho {
  private readonly carrinhoService = inject(CarrinhoService);
  private readonly cupomService = inject(CupomService);
  private readonly authService = inject(EcommerceAuthService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  readonly itens = this.carrinhoService.items;
  readonly quantidadeTotal = this.carrinhoService.quantidadeTotal;
  readonly valorTotal = this.carrinhoService.valorTotal;
  readonly cupom = this.carrinhoService.cupom;
  readonly desconto = this.carrinhoService.desconto;
  readonly valorTotalFinal = this.carrinhoService.valorTotalFinal;
  readonly logado = this.authService.logado;

  readonly cupomControl = new FormControl('');
  readonly carregandoCupom = signal(false);
  readonly imageBase = 'http://localhost:8080/pijamas/imagens/download/';

  getImageUrl(pijama: PijamaEcommerce): string {
    const imagem = pijama.imagens?.[0];
    return imagem?.fid ? this.imageBase + encodeURIComponent(imagem.fid) : 'https://placehold.co/120x90?text=Pijama';
  }

  aumentar(pijamaId: number, qtd: number): void {
    this.carrinhoService.atualizarQuantidade(pijamaId, qtd + 1);
  }

  diminuir(pijamaId: number, qtd: number): void {
    this.carrinhoService.atualizarQuantidade(pijamaId, qtd - 1);
  }

  remover(pijamaId: number): void {
    this.carrinhoService.remover(pijamaId);
  }

  limpar(): void {
    if (!confirm('Deseja mesmo limpar o carrinho?')) return;
    this.carrinhoService.limpar();
  }

  aplicarCupom(): void {
    const codigo = (this.cupomControl.value ?? '').trim().toUpperCase();
    if (!codigo) {
      this.snack.open('Digite um código de cupom.', 'OK', { duration: 3000 });
      return;
    }
    this.carregandoCupom.set(true);
    this.cupomService.validar(codigo).subscribe({
      next: cupom => {
        if (!cupom.ativo) { this.snack.open('Cupom inativo.', 'OK', { duration: 3000 }); this.carregandoCupom.set(false); return; }
        const desconto = cupom.percentual
          ? this.valorTotal() * (cupom.valorDesconto / 100)
          : cupom.valorDesconto;
        this.carrinhoService.aplicarCupom(cupom.codigo, desconto);
        this.cupomControl.reset();
        this.carregandoCupom.set(false);
        this.snack.open(`Cupom "${cupom.codigo}" aplicado! Desconto: R$ ${desconto.toFixed(2)}`, 'OK', { duration: 4000 });
      },
      error: () => {
        this.carregandoCupom.set(false);
        this.snack.open('Cupom inválido ou expirado.', 'OK', { duration: 3000 });
      },
    });
  }

  removerCupom(): void {
    this.carrinhoService.removerCupom();
    this.snack.open('Cupom removido.', 'OK', { duration: 2000 });
  }

  finalizar(): void {
    if (!this.logado()) { this.router.navigate(['/login']); return; }
    this.router.navigate(['/checkout']);
  }
}
