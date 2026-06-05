import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Categoria } from '../models/categoria.model';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private readonly api = 'http://localhost:8080/categorias';

  constructor(private httpClient: HttpClient) {}

  findAll(): Observable<Categoria[]> {
    return this.httpClient.get<Categoria[]>(this.api);
  }

  findById(id: number): Observable<Categoria> {
    return this.httpClient.get<Categoria>(`${this.api}/${id}`);
  }

  create(categoria: Categoria): Observable<Categoria> {
    return this.httpClient.post<Categoria>(this.api, categoria);
  }

  update(categoria: Categoria): Observable<Categoria> {
    return this.httpClient.put<Categoria>(`${this.api}/${categoria.id}`, categoria);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}
