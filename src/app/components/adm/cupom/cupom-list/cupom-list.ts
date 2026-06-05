import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Cupom } from '../../../../models/cupom.model';
import { CupomService } from '../../../../services/cupom.service';

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
  selector: 'app-cupom-list',
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink,
            MatTableModule, MatPaginatorModule, MatChipsModule],
  providers: [{ provide: MatPaginatorIntl, useFactory: getPtPaginatorIntl }],
  templateUrl: './cupom-list.html',
  styleUrl: './cupom-list.css',
})
export class CupomList implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['numero', 'codigo', 'desconto', 'validade', 'ativo', 'acao'];
  dataSource = new MatTableDataSource<Cupom>([]);

  constructor(private cupomService: CupomService, private snack: MatSnackBar) {}

  ngOnInit(): void { this.carregar(); }
  ngAfterViewInit(): void { this.dataSource.paginator = this.paginator; }

  carregar(): void {
    this.cupomService.findAll().subscribe(data => { this.dataSource.data = data; });
  }

  applyFilter(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  excluir(id: number): void {
    if (!confirm('Deseja realmente excluir este cupom?')) return;
    this.cupomService.delete(id).subscribe({
      next: () => { this.snack.open('Cupom excluído!', 'OK', { duration: 2500, verticalPosition: 'top' }); this.carregar(); },
      error: () => this.snack.open('Erro ao excluir cupom.', 'OK', { duration: 2500, verticalPosition: 'top' }),
    });
  }
}
