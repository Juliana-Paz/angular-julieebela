import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from "@angular/router";
import { MatTableDataSource } from '@angular/material/table';
import { Municipio } from '../../../models/municipio.model';
import { MunicipioService } from '../../../services/municipio.service';
import { MatTableModule } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { forkJoin } from 'rxjs';

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
    selector: 'app-municipio-list',
    imports: [MatIconModule, MatButtonModule, RouterLink, MatTableModule, MatPaginatorModule],
    providers: [{ provide: MatPaginatorIntl, useFactory: getPortuguesePaginatorIntl }],

    templateUrl: './municipio-list.html',
    styleUrl: './municipio-list.css',
})
export class MunicipioList implements OnInit {
    // variaveis de controle de paginacao
    totalRecords = 3;
    page = 0;
    pageSize = 8;

    displayedColumns: string[] = ['numero', 'nome', 'estado', 'acao'];
    dataSource = new MatTableDataSource<Municipio>([]);

    constructor(private municipioService: MunicipioService) { }

    ngOnInit(): void {
        forkJoin({
            municipios: this.municipioService.findAll(this.page, this.pageSize),
            total: this.municipioService.count()
        }).subscribe(result => {

            this.dataSource.data = result.municipios;
            this.totalRecords = result.total;

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
