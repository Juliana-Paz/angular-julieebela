import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from "@angular/router";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource } from '@angular/material/table';
import { Aluno } from '../../../models/aluno.model';
import { AlunoService } from '../../../services/aluno.service';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';

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
  selector: 'app-aluno-list',
  imports: [MatIconModule, MatButtonModule, RouterLink, MatFormFieldModule,
    MatTableModule, MatInputModule, MatPaginatorModule, MatCardModule],
  providers: [{ provide: MatPaginatorIntl, useFactory: getPortuguesePaginatorIntl }],
  templateUrl: './aluno-list.html',
  styleUrl: './aluno-list.css',
})
export class AlunoList implements OnInit {
  // variaveis de controle de paginacao
  totalRecords = 5;
  page = 0;
  pageSize = 8;

  displayedColumns: string[] = ['numero', 'nome', 'sobrenome', 'email', 'acao'];
  dataSource = new   MatTableDataSource<Aluno>([]);

  constructor(private alunoService: AlunoService) { }

  ngOnInit(): void {
    forkJoin({
      items: this.alunoService.findAll(this.page, this.pageSize),
      total: this.alunoService.count()
    }).subscribe(({ items, total }) => {
      this.dataSource.data = items;
      this.totalRecords = total;
    });
  }

  paginar(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.ngOnInit(); // para fazer a nova busca dos dados 
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
