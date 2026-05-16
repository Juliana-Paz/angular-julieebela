import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CarrinhoService } from '../../../services/carrinho.service';
import { PlanoEcommerce } from '../ecommerce.types';

@Component({
  selector: 'app-detalhe-plano',
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './detalhe-plano.html',
  styleUrl: './detalhe-plano.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalhePlano implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly carrinhoService = inject(CarrinhoService);
  private readonly router = inject(Router);

  private readonly planoSignal = signal<PlanoEcommerce | null>(null);
  readonly plano = computed(() => this.planoSignal());
  readonly imageBase = 'http://localhost:8080/planos/image/download/';

  ngOnInit(): void {
    const plano = this.activatedRoute.snapshot.data['plano'] as PlanoEcommerce | null;
    this.planoSignal.set(plano);
  }

  getImageUrl(plano: PlanoEcommerce): string {
    const imagem = plano.imagens?.[0] ?? plano.arquivos?.[0];

    if (imagem?.fid) {
      return this.imageBase + encodeURIComponent(imagem.fid);
    }

    return 'https://placehold.co/800x420?text=Sem+Imagem';
  }

  adicionarAoCarrinho(): void {
    const plano = this.planoSignal();

    if (!plano) {
      return;
    }

    this.carrinhoService.adicionar(plano);
    this.router.navigate(['/carrinho']);
  }
}
