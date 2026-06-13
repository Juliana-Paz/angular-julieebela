import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Marca } from '../models/marca.model';

interface MarcaPage {
  data: Marca[];
}

@Injectable({
  providedIn: 'root',
})
export class MarcaService {
  private readonly api = 'http://localhost:8080/marcas';

  constructor(private httpClient: HttpClient) {}

  findAll(): Observable<Marca[]> {
    return this.httpClient.get<MarcaPage>(this.api).pipe(
      map(resp => resp.data ?? [])
    );
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
