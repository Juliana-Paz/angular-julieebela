import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Material } from '../../../../models/material.model';
import { MaterialService } from '../../../../services/material.service';

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
  selector: 'app-material-list',
  imports: [MatIconModule, MatButtonModule, RouterLink, MatTableModule, MatPaginatorModule],
  providers: [{ provide: MatPaginatorIntl, useFactory: getPtPaginatorIntl }],
  templateUrl: './material-list.html',
  styleUrl: './material-list.css',
})
export class MaterialList implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['numero', 'nome', 'descricao', 'acao'];
  dataSource = new MatTableDataSource<Material>([]);

  constructor(private materialService: MaterialService, private snack: MatSnackBar) {}

  ngOnInit(): void { this.carregar(); }
  ngAfterViewInit(): void { this.dataSource.paginator = this.paginator; }

  carregar(): void {
    this.materialService.findAll().subscribe(data => { this.dataSource.data = data; });
  }

  applyFilter(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  excluir(id: number): void {
    if (!confirm('Deseja realmente excluir este material?')) return;
    this.materialService.delete(id).subscribe({
      next: () => { this.carregar(); this.snack.open('Material excluído!', 'OK', { duration: 2500, verticalPosition: 'top' }); },
      error: (err) => {
        let mensagem = 'Erro ao excluir. Tente novamente.';
        if (err.status === 400 && err.error?.errors?.length > 0) {
          mensagem = err.error.errors[0].message;
        }
        this.snack.open(mensagem, 'Fechar', { duration: 5000, verticalPosition: 'top' });
      },
    });
  }
}
