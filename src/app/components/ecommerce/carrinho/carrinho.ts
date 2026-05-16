import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CarrinhoService } from '../../../services/carrinho.service';
import { PlanoEcommerce } from '../ecommerce.types';

@Component({
  selector: 'app-carrinho',
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Carrinho {
  private readonly carrinhoService = inject(CarrinhoService);
  readonly itens = this.carrinhoService.items;
  readonly quantidadeTotal = this.carrinhoService.quantidadeTotal;
  readonly valorTotal = this.carrinhoService.valorTotal;
  readonly imageBase = 'http://localhost:8080/planos/image/download/';

  getImageUrl(plano: PlanoEcommerce): string {
    const imagem = plano.imagens?.[0] ?? plano.arquivos?.[0];

    if (imagem?.fid) {
      return this.imageBase + encodeURIComponent(imagem.fid);
    }

    return 'https://placehold.co/240x160?text=Sem+Imagem';
  }

  remover(planoId: number): void {
    this.carrinhoService.remover(planoId);
  }

  limpar(): void {
    this.carrinhoService.limpar();
  }
}
