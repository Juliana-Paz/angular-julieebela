import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Marca } from '../../../../models/marca.model';
import { MarcaService } from '../../../../services/marca.service';

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
  selector: 'app-marca-list',
  imports: [MatIconModule, MatButtonModule, RouterLink, MatTableModule, MatPaginatorModule],
  providers: [{ provide: MatPaginatorIntl, useFactory: getPtPaginatorIntl }],
  templateUrl: './marca-list.html',
  styleUrl: './marca-list.css',
})
export class MarcaList implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['numero', 'nome', 'descricao', 'acao'];
  dataSource = new MatTableDataSource<Marca>([]);

  constructor(private marcaService: MarcaService, private snack: MatSnackBar) {}

  ngOnInit(): void { this.carregar(); }
  ngAfterViewInit(): void { this.dataSource.paginator = this.paginator; }

  carregar(): void {
    this.marcaService.findAll().subscribe(data => { this.dataSource.data = data; });
  }

  applyFilter(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  excluir(id: number): void {
    if (!confirm('Deseja realmente excluir esta marca?')) return;
    this.marcaService.delete(id).subscribe({
      next: () => { this.snack.open('Marca excluída!', 'OK', { duration: 2500, verticalPosition: 'top' }); this.carregar(); },
      error: () => this.snack.open('Erro ao excluir marca.', 'OK', { duration: 2500, verticalPosition: 'top' }),
    });
  }
}
