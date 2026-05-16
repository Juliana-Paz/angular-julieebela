import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Plano } from '../../../models/plano.model';
import { CarrinhoService } from '../../../services/carrinho.service';
import { PlanoEcommerce } from '../ecommerce.types';
import { PlanoService } from '../../../services/plano.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  planos: PlanoEcommerce[] = [];
  loading = true;
  errorMessage = '';
  readonly imageBase = 'http://localhost:8080/planos/image/download/';

  constructor(
    private planoService: PlanoService,
    private changeDetectorRef: ChangeDetectorRef,
    private carrinhoService: CarrinhoService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.planoService.findAll().subscribe({
      next: data => {
        this.planos = Array.isArray(data) ? data : [];
        this.loading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.planos = [];
        this.loading = false;
        this.errorMessage = 'Não foi possível carregar os planos agora.';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  getImageUrl(plano: PlanoEcommerce): string {
    const imagem = plano.imagens?.[0] ?? plano.arquivos?.[0];

    if (imagem?.fid) {
      return this.imageBase + encodeURIComponent(imagem.fid);
    }
    return 'https://placehold.co/400x220?text=Sem+Imagem';
  }

  adicionarCarrinho(plano: Plano): void {
    this.carrinhoService.adicionar(plano);
    this.router.navigate(['/carrinho']);
  }

  verDetalhe(planoId: number): void {
    this.router.navigate(['/detalhe-plano', planoId]);
  }
}
