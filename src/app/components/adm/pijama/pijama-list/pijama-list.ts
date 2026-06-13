import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Pijama } from '../../../../models/pijama.model';
import { PijamaService } from '../../../../services/pijama.service';

function getPtPaginatorIntl(): MatPaginatorIntl {
  const i = new MatPaginatorIntl();
  i.itemsPerPageLabel = 'Itens por página:';
  i.nextPageLabel = 'Próxima página';
  i.previousPageLabel = 'Página anterior';
  i.firstPageLabel = 'Primeira página';
  i.lastPageLabel = 'Última página';
  i.getRangeLabel = (page, pageSize, length) => {
    if (length === 0 || pageSize === 0) return `0 de ${length}`;
    const start = page * pageSize;
    return `${start + 1} – ${Math.min(start + pageSize, length)} de ${length}`;
  };
  return i;
}

@Component({
  selector: 'app-pijama-list',
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink, MatTableModule, MatPaginatorModule],
  providers: [{ provide: MatPaginatorIntl, useFactory: getPtPaginatorIntl }],
  templateUrl: './pijama-list.html',
  styleUrl: './pijama-list.css',
})
export class PijamaList implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['numero', 'imagem', 'nome', 'categoria', 'preco', 'variantes', 'ativo', 'acao'];
  dataSource = new MatTableDataSource<Pijama>([]);
  readonly imageBase = 'http://localhost:8080/pijamas/imagens/download/';

  constructor(private pijamaService: PijamaService, private snack: MatSnackBar) {}

  ngAfterViewInit(): void {
    this.carregar(0, this.paginator.pageSize);
    this.paginator.page.subscribe(ev => this.carregar(ev.pageIndex, ev.pageSize));
  }

  carregar(page: number, pageSize: number): void {
    this.pijamaService.findAllPaged(page, pageSize).subscribe(({ data, total }) => {
      this.dataSource.data = data;
      this.paginator.length = total;
    });
  }

  applyFilter(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  getImageUrl(pijama: Pijama): string {
    const fid = pijama.imagens?.[0]?.fid;
    return fid ? this.imageBase + encodeURIComponent(fid) : 'https://placehold.co/48x48?text=?';
  }

  excluir(id: number): void {
    if (!confirm('Deseja realmente excluir este pijama?')) return;
    this.pijamaService.delete(id).subscribe({
      next: () => { this.snack.open('Pijama excluído!', 'OK', { duration: 2500, verticalPosition: 'top' }); this.carregar(this.paginator.pageIndex, this.paginator.pageSize); },
      error: () => this.snack.open('Erro ao excluir pijama.', 'OK', { duration: 2500, verticalPosition: 'top' }),
    });
  }
}
