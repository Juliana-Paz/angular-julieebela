import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PageEvent, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { Plano } from '../../../models/plano.model';
import { PlanoService } from '../../../services/plano.service';

function getPortuguesePaginatorIntl(): MatPaginatorIntl {
  const paginatorIntl = new MatPaginatorIntl();
  paginatorIntl.itemsPerPageLabel = 'Itens por página:';
  paginatorIntl.nextPageLabel = 'Próxima página';
  paginatorIntl.previousPageLabel = 'Página anterior';
  paginatorIntl.firstPageLabel = 'Primeira página';
  paginatorIntl.lastPageLabel = 'Última página';
  paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }

    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, length);

    return `${startIndex + 1} - ${endIndex} de ${length}`;
  };

  return paginatorIntl;
}

@Component({
  selector: 'app-plano-list',
  imports: [MatIconModule, MatButtonModule, RouterLink, MatTableModule, MatPaginatorModule],
  providers: [{ provide: MatPaginatorIntl, useFactory: getPortuguesePaginatorIntl }],
  templateUrl: './plano-list.html',
  styleUrl: './plano-list.css',
})
export class PlanoList implements OnInit {
  totalRecords = 0;
  page = 0;
  pageSize = 8;
  termoBusca = '';

  displayedColumns: string[] = ['numero', 'nome', 'maxAlunos', 'precoMensal', 'acao'];
  dataSource = new MatTableDataSource<Plano>([]);

  constructor(private planoService: PlanoService) { }

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    const requisicao = this.termoBusca.trim()
      ? this.planoService.findByNomeWithHeaders(this.termoBusca.trim(), this.page, this.pageSize)
      : this.planoService.findAllWithHeaders(this.page, this.pageSize);

    requisicao.subscribe({
      next: (response) => {
        this.dataSource.data = response.body ?? [];
        this.totalRecords = Number(response.headers.get('X-Total-Count') ?? 0);
      },
      error: () => {
        this.dataSource.data = [];
        this.totalRecords = 0;
      }
    });
  }

  paginar(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.carregarDados();
  }

  aplicarBusca(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.termoBusca = valor;
    this.page = 0;
    this.carregarDados();
  }
}
