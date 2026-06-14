import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { Pijama } from '../../../../models/pijama.model';
import { PijamaService } from '../../../../services/pijama.service';

@Component({
  selector: 'app-pijama-list',
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink, MatTableModule],
  templateUrl: './pijama-list.html',
  styleUrl: './pijama-list.css',
})
export class PijamaList implements OnInit, OnDestroy {
  displayedColumns: string[] = ['numero', 'imagem', 'nome', 'categoria', 'preco', 'variantes', 'ativo', 'acao'];
  dataSource = new MatTableDataSource<Pijama>([]);
  readonly imageBase = 'http://localhost:8080/pijamas/imagens/download/';

  readonly total       = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize    = signal(25);
  readonly searchTerm  = signal('');

  private readonly searchInput$ = new Subject<string>();
  private readonly destroy$     = new Subject<void>();

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  readonly rangeStart = computed(() => this.total() === 0 ? 0 : this.currentPage() * this.pageSize() + 1);
  readonly rangeEnd   = computed(() => Math.min((this.currentPage() + 1) * this.pageSize(), this.total()));

  readonly pageNumbers = computed((): (number | '...')[] => {
    const total = this.totalPages();
    if (total <= 1) return [];
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const cur = this.currentPage();
    const result: (number | '...')[] = [0];
    if (cur <= 3) {
      for (let i = 1; i <= Math.min(4, total - 2); i++) result.push(i);
      result.push('...', total - 1);
    } else if (cur >= total - 4) {
      result.push('...');
      for (let i = Math.max(1, total - 5); i <= total - 1; i++) result.push(i);
    } else {
      result.push('...', cur - 1, cur, cur + 1, '...', total - 1);
    }
    return result;
  });

  constructor(
    private pijamaService: PijamaService,
    private snack: MatSnackBar,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.carregar(0, this.pageSize());
    this.searchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(term => {
      this.searchTerm.set(term);
      this.carregar(0, this.pageSize(), term);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregar(page: number, size: number, nome?: string): void {
    this.pijamaService.findAllPaged(page, size, nome).subscribe(({ data, total }) => {
      this.dataSource.data = data;
      this.total.set(total);
      this.currentPage.set(page);
    });
  }

  onSearch(event: Event): void {
    this.searchInput$.next((event.target as HTMLInputElement).value.trim());
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages() || page === this.currentPage()) return;
    this.carregar(page, this.pageSize(), this.searchTerm() || undefined);
  }

  goFirst(): void  { this.goToPage(0); }
  goLast(): void   { this.goToPage(this.totalPages() - 1); }
  prevPage(): void { this.goToPage(this.currentPage() - 1); }
  nextPage(): void { this.goToPage(this.currentPage() + 1); }

  onPageSizeChange(event: Event): void {
    const size = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pageSize.set(size);
    this.carregar(0, size, this.searchTerm() || undefined);
  }

  isNumber(p: number | '...'): p is number {
    return typeof p === 'number';
  }

  formatIndex(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  hasImage(pijama: Pijama): boolean {
    return !!(pijama.imagens?.[0]?.fid);
  }

  getImageUrl(pijama: Pijama): string {
    const fid = pijama.imagens?.[0]?.fid;
    return fid ? this.imageBase + encodeURIComponent(fid) : '';
  }

  verPijama(id: number): void {
    this.router.navigate(['/adm/pijamas/view', id]);
  }

  excluir(id: number): void {
    if (!confirm('Deseja realmente excluir este pijama?')) return;
    this.pijamaService.delete(id).subscribe({
      next: () => {
        this.snack.open('Pijama excluído!', 'OK', { duration: 2500, verticalPosition: 'top' });
        this.carregar(this.currentPage(), this.pageSize(), this.searchTerm() || undefined);
      },
      error: () => this.snack.open('Erro ao excluir pijama.', 'OK', { duration: 2500, verticalPosition: 'top' }),
    });
  }
}
