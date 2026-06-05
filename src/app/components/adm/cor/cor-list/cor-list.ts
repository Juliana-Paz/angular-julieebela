import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Cor } from '../../../../models/cor.model';
import { CorService } from '../../../../services/cor.service';

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
  selector: 'app-cor-list',
  imports: [MatIconModule, MatButtonModule, RouterLink, MatTableModule, MatPaginatorModule],
  providers: [{ provide: MatPaginatorIntl, useFactory: getPtPaginatorIntl }],
  templateUrl: './cor-list.html',
  styleUrl: './cor-list.css',
})
export class CorList implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['numero', 'preview', 'nome', 'hexadecimal', 'acao'];
  dataSource = new MatTableDataSource<Cor>([]);

  constructor(private corService: CorService, private snack: MatSnackBar) {}

  ngOnInit(): void { this.carregar(); }
  ngAfterViewInit(): void { this.dataSource.paginator = this.paginator; }

  carregar(): void {
    this.corService.findAll().subscribe(data => { this.dataSource.data = data; });
  }

  applyFilter(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  excluir(id: number): void {
    if (!confirm('Deseja realmente excluir esta cor?')) return;
    this.corService.delete(id).subscribe({
      next: () => { this.snack.open('Cor excluída!', 'OK', { duration: 2500, verticalPosition: 'top' }); this.carregar(); },
      error: () => this.snack.open('Erro ao excluir cor.', 'OK', { duration: 2500, verticalPosition: 'top' }),
    });
  }
}
