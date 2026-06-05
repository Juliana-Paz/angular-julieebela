import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Categoria } from '../../../../models/categoria.model';
import { CategoriaService } from '../../../../services/categoria.service';

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
  selector: 'app-categoria-list',
  imports: [MatIconModule, MatButtonModule, RouterLink, MatTableModule, MatPaginatorModule],
  providers: [{ provide: MatPaginatorIntl, useFactory: getPtPaginatorIntl }],
  templateUrl: './categoria-list.html',
  styleUrl: './categoria-list.css',
})
export class CategoriaList implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['numero', 'nome', 'descricao', 'acao'];
  dataSource = new MatTableDataSource<Categoria>([]);

  constructor(
    private categoriaService: CategoriaService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  carregar(): void {
    this.categoriaService.findAll().subscribe(data => {
      this.dataSource.data = data;
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  excluir(id: number): void {
    if (!confirm('Deseja realmente excluir esta categoria?')) return;
    this.categoriaService.delete(id).subscribe({
      next: () => {
        this.snack.open('Categoria excluída com sucesso!', 'OK', { duration: 2500, verticalPosition: 'top' });
        this.carregar();
      },
      error: () => this.snack.open('Erro ao excluir categoria.', 'OK', { duration: 2500, verticalPosition: 'top' }),
    });
  }
}
