import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Marca } from '../models/marca.model';

@Injectable({
  providedIn: 'root',
})
export class MarcaService {
  private readonly api = 'http://localhost:8080/marcas';

  constructor(private httpClient: HttpClient) {}

  findAll(): Observable<Marca[]> {
    return this.httpClient.get<Marca[]>(this.api);
  }

  findById(id: number): Observable<Marca> {
    return this.httpClient.get<Marca>(`${this.api}/${id}`);
  }

  create(marca: Marca): Observable<Marca> {
    return this.httpClient.post<Marca>(this.api, marca);
  }

  update(marca: Marca): Observable<Marca> {
    return this.httpClient.put<Marca>(`${this.api}/${marca.id}`, marca);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}
