import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Estado } from '../models/estado.model';

@Injectable({
  providedIn: 'root',
})
export class EstadoService {

  private readonly api = 'http://localhost:8080/estados';

  constructor(private httpClient: HttpClient) { }

  //  Buscar todos
  findAll(page?: number, pageSize?: number): Observable<Estado[]> {

    let params = {};
    if (page !== undefined && pageSize !== undefined) {
      params = {
        page: page?.toString(),
        size: pageSize?.toString()
      }
    }

    return this.httpClient.get<Estado[]>(this.api, {params});
  }

  count(): Observable<any> {
    return this.httpClient.get<any>(`${this.api}/count`);
  }

  //  Buscar por ID
  findById(id: any): Observable<Estado> {
    return this.httpClient.get<Estado>(`${this.api}/${id}`);
  }
  
  //  Criar
  create(estado: Estado): Observable<Estado> {
    return this.httpClient.post<Estado>(this.api, estado);
  }
  
  //  Atualizar
  update(estado: Estado): Observable<Estado> {
    return this.httpClient.put<Estado>(`${this.api}/${estado.id}`, estado);
  }
  //  Deletar
  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }

}
