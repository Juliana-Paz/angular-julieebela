import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from "@angular/router";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource } from '@angular/material/table';
import { Municipio } from '../../../models/municipio.model';
import { MunicipioService } from '../../../services/municipio.service';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-municipio-list',
    imports: [MatToolbarModule, MatIconModule, MatButtonModule,
        RouterLink, MatFormFieldModule, MatTableModule, MatIcon, MatInputModule, MatPaginatorModule],

    templateUrl: './municipio-list.html',
    styleUrl: './municipio-list.css',
})
export class MunicipioList implements OnInit {
    // variaveis de controle de paginacao
    totalRecords = 3;
    page = 0;
    pageSize = 2;

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
