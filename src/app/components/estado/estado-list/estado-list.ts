import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from "@angular/router";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource } from '@angular/material/table';
import { Estado } from '../../../models/estado.model';
import { EstadoService } from '../../../services/estado.service';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-estado-list',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule,
    RouterLink, MatFormFieldModule, MatTableModule, MatIcon, MatInputModule, MatPaginatorModule],

  templateUrl: './estado-list.html',
  styleUrl: './estado-list.css',
})
export class EstadoList implements OnInit {
  // variaveis de controle de paginacao
  totalRecords = 3;
  page = 0;
  pageSize = 2;

  displayedColumns: string[] = ['numero', 'nome', 'sigla', 'acao'];
  dataSource = new   MatTableDataSource<Estado>([]);

  constructor(private estadoService: EstadoService) { }

  ngOnInit(): void {
    forkJoin({
      items: this.estadoService.findAll(this.page, this.pageSize),
      total: this.estadoService.count()
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
