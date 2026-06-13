import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Municipio } from '../models/municipio.model';

@Injectable({
  providedIn: 'root',
})
export class MunicipioService {

  private readonly api = 'http://localhost:8080/municipios';

  constructor(private httpClient: HttpClient) { }

  //  Buscar todos
  findAll(page?: number, pageSize?: number): Observable<Municipio[]> {

    let params = {};
    if (page !== undefined && pageSize !== undefined) {
      params = {
        page: page?.toString(),
        size: pageSize?.toString()
      }
    }

    return this.httpClient.get<Municipio[]>(this.api, {params});
  }

  count(): Observable<any> {
    return this.httpClient.get<any>(`${this.api}/count`);
  }

  //  Buscar por ID
  findById(id: any): Observable<Municipio> {
    return this.httpClient.get<Municipio>(`${this.api}/${id}`);
  }
  
  //  Criar
  create(municipio: Municipio): Observable<Municipio> {
    return this.httpClient.post<Municipio>(this.api, municipio);
  }
  
  //  Atualizar
  update(municipio: Municipio): Observable<Municipio> {
    return this.httpClient.put<Municipio>(`${this.api}/${municipio.id}`, municipio);
  }
  //  Deletar
  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }

}
