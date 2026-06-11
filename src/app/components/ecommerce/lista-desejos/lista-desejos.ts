import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ListaDesejosService } from '../../../services/lista-desejos.service';
import { FavoritosService } from '../../../services/favoritos.service';
import { CarrinhoService } from '../../../services/carrinho.service';
import { Pijama } from '../../../models/pijama.model';
import { PijamaEcommerce } from '../ecommerce.types';

@Component({
  selector: 'app-lista-desejos',
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './lista-desejos.html',
  styleUrl: './lista-desejos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaDesejos implements OnInit {
  private readonly listaDesejosService = inject(ListaDesejosService);
  private readonly favoritosService = inject(FavoritosService);
  private readonly carrinhoService = inject(CarrinhoService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  readonly pijamas = signal<Pijama[]>([]);
  readonly loading = signal(true);
  readonly imageBase = 'http://localhost:8080/pijamas/imagens/download/';

  get favoritosIds() { return this.favoritosService.ids; }

  ngOnInit(): void {
    this.favoritosService.carregar();
    this.listaDesejosService.listar().subscribe({
      next: lista => { this.pijamas.set(lista); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
  }

  getImageUrl(pijama: Pijama): string {
    const arq = pijama.imagens?.[0];
    return arq?.fid ? this.imageBase + encodeURIComponent(arq.fid) : 'https://placehold.co/400x300?text=Pijama';
  }

  remover(pijama: Pijama): void {
    this.favoritosService.toggle(pijama.id);
    this.pijamas.update(lista => lista.filter(p => p.id !== pijama.id));
    this.snack.open(`"${pijama.nome}" removido dos desejos.`, 'OK', { duration: 2500 });
  }

  adicionarCarrinho(pijama: Pijama): void {
    this.carrinhoService.adicionar(pijama as PijamaEcommerce);
    this.snack.open(`${pijama.nome} adicionado ao carrinho!`, 'Ver carrinho', { duration: 3000, verticalPosition: 'top' })
      .onAction().subscribe(() => this.router.navigate(['/carrinho']));
  }

  verDetalhe(id: number): void { this.router.navigate(['/detalhe-pijama', id]); }
}
