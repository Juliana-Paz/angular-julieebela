import { inject, Injectable, signal } from '@angular/core';
import { Pijama } from '../models/pijama.model';
import { EcommerceAuthService } from './ecommerce-auth.service';
import { ListaDesejosService } from './lista-desejos.service';

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private readonly authService = inject(EcommerceAuthService);
  private readonly listaDesejos = inject(ListaDesejosService);

  private readonly favoritosIds = signal<number[]>([]);

  get ids() { return this.favoritosIds; }

  carregar(): void {
    if (!this.authService.logado()) return;
    this.listaDesejos.listar().subscribe({
      next: (lista: Pijama[]) => {
        this.favoritosIds.set(lista.map(i => i.id));
      },
      error: () => {},
    });
  }

  ehFavorito(id: number): boolean {
    return this.favoritosIds().includes(id);
  }

  toggle(id: number): void {
    if (this.ehFavorito(id)) {
      this.listaDesejos.remover(id).subscribe({
        next: () => this.favoritosIds.update(ids => ids.filter(x => x !== id)),
        error: () => {},
      });
    } else {
      this.listaDesejos.adicionar(id).subscribe({
        next: () => this.favoritosIds.update(ids => [...ids, id]),
        error: () => {},
      });
    }
  }
}
