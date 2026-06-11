import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PijamaEcommerce } from '../ecommerce.types';
import { Categoria } from '../../../models/categoria.model';
import { PijamaService } from '../../../services/pijama.service';
import { CategoriaService } from '../../../services/categoria.service';
import { ListaDesejosService } from '../../../services/lista-desejos.service';
import { EcommerceAuthService } from '../../../services/ecommerce-auth.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, MatCardModule, MatIconModule, MatPaginatorModule, MatTooltipModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private readonly pijamaService = inject(PijamaService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly listaDesejosService = inject(ListaDesejosService);
  private readonly authService = inject(EcommerceAuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
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
    forkJoin({
      pijamas: this.pijamaService.findAll(),
      categorias: this.categoriaService.findAll(),
    }).subscribe({
      next: ({ pijamas, categorias }) => {
        this.pijamas.set(pijamas);
        this.categorias.set(categorias);
        this.loading.set(false);
        this.aplicarQueryParams(this.route.snapshot.queryParams);
      },
      error: () => { this.loading.set(false); this.errorMessage.set('Não foi possível carregar os pijamas.'); },
    });

    if (this.logado()) {
      this.listaDesejosService.listar().subscribe({
        next: lista => this.desejosIds.set(lista.map(p => p.id)),
        error: () => {},
      });
    }

    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        if (this.categorias().length > 0) {
          this.aplicarQueryParams(params);
        }
      });
  }

  private aplicarQueryParams(params: Params): void {
    if (params['busca'] !== undefined) {
      this.searchTerm.set(params['busca'] || '');
      this.pageIndex.set(0);
    }
    if (params['categoria']) {
      const cat = this.categorias().find(c =>
        c.nome.toLowerCase().includes((params['categoria'] as string).toLowerCase()));
      if (cat) this.filtrarCategoria(cat.id);
    } else if (!params['busca']) {
      this.filtrarCategoria(null);
    }
  }

  filtrarCategoria(id: number | null): void { this.categoriaAtiva.set(id); this.pageIndex.set(0); }

  mudarPagina(event: PageEvent): void { this.pageIndex.set(event.pageIndex); this.pageSize.set(event.pageSize); }

  getImageUrl(pijama: PijamaEcommerce): string {
    const imagem = pijama.imagens?.[0];
    return imagem?.fid ? this.imageBase + encodeURIComponent(imagem.fid) : 'https://placehold.co/400x300?text=Pijama';
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
