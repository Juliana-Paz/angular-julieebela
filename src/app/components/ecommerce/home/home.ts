import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PijamaEcommerce } from '../ecommerce.types';
import { Categoria } from '../../../models/categoria.model';
import { PijamaService } from '../../../services/pijama.service';
import { CategoriaService } from '../../../services/categoria.service';
import { CarrinhoService } from '../../../services/carrinho.service';
import { ListaDesejosService } from '../../../services/lista-desejos.service';
import { EcommerceAuthService } from '../../../services/ecommerce-auth.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule,
            MatIconModule, MatChipsModule, MatInputModule, MatFormFieldModule,
            MatPaginatorModule, MatTooltipModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private readonly pijamaService = inject(PijamaService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly carrinhoService = inject(CarrinhoService);
  private readonly listaDesejosService = inject(ListaDesejosService);
  private readonly authService = inject(EcommerceAuthService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly pijamas = signal<PijamaEcommerce[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly categoriaAtiva = signal<number | null>(null);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(12);
  readonly desejosIds = signal<number[]>([]);
  readonly searchTerm = signal('');

  readonly logado = this.authService.logado;
  readonly imageBase = 'http://localhost:8080/pijamas/imagens/download/';
  readonly searchControl = new FormControl('');

  readonly pijamasFiltrados = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const catId = this.categoriaAtiva();
    return this.pijamas().filter(p => {
      const matchSearch = !search || p.nome.toLowerCase().includes(search);
      const matchCat = catId === null || p.categoria?.id === catId;
      return matchSearch && matchCat;
    });
  });

  readonly pijamasPagina = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.pijamasFiltrados().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(v => { this.searchTerm.set(v ?? ''); this.pageIndex.set(0); });

    forkJoin({
      pijamas: this.pijamaService.findAll(),
      categorias: this.categoriaService.findAll(),
    }).subscribe({
      next: ({ pijamas, categorias }) => {
        this.pijamas.set(pijamas);
        this.categorias.set(categorias);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.errorMessage.set('Não foi possível carregar os pijamas.'); },
    });

    if (this.logado()) {
      this.listaDesejosService.listar().subscribe({
        next: lista => this.desejosIds.set(lista.map(p => p.id)),
        error: () => {},
      });
    }
  }

  filtrarCategoria(id: number | null): void { this.categoriaAtiva.set(id); this.pageIndex.set(0); }

  mudarPagina(event: PageEvent): void { this.pageIndex.set(event.pageIndex); this.pageSize.set(event.pageSize); }

  getImageUrl(pijama: PijamaEcommerce): string {
    const imagem = pijama.imagens?.[0];
    return imagem?.fid ? this.imageBase + encodeURIComponent(imagem.fid) : 'https://placehold.co/400x300?text=Pijama';
  }

  adicionarCarrinho(pijama: PijamaEcommerce): void {
    this.carrinhoService.adicionar(pijama);
    this.snack.open(`${pijama.nome} adicionado!`, 'Ver carrinho', { duration: 3000, verticalPosition: 'top' })
      .onAction().subscribe(() => this.router.navigate(['/carrinho']));
  }

  verDetalhe(id: number): void { this.router.navigate(['/detalhe-pijama', id]); }

  noDesejo(id: number): boolean { return this.desejosIds().includes(id); }

  toggleDesejos(pijama: PijamaEcommerce, event: Event): void {
    event.stopPropagation();
    if (!this.logado()) { this.router.navigate(['/login']); return; }
    if (this.noDesejo(pijama.id)) {
      this.listaDesejosService.remover(pijama.id).subscribe({
        next: () => this.desejosIds.update(ids => ids.filter(id => id !== pijama.id)),
      });
    } else {
      this.listaDesejosService.adicionar(pijama.id).subscribe({
        next: () => this.desejosIds.update(ids => [...ids, pijama.id]),
      });
    }
  }
}
