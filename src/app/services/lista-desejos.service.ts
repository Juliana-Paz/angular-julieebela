import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Pijama } from '../models/pijama.model';

@Injectable({ providedIn: 'root' })
export class ListaDesejosService {
  private readonly api = 'http://localhost:8080/lista-desejos';

  constructor(private httpClient: HttpClient) {}

  listar(): Observable<Pijama[]> {
    return this.httpClient.get<unknown>(this.api).pipe(
      map((r): Pijama[] => {
        if (Array.isArray(r)) return r as Pijama[];
        if (r && typeof r === 'object' && 'pijamas' in r) {
          const arr = (r as { pijamas: unknown }).pijamas;
          return Array.isArray(arr) ? (arr as Pijama[]) : [];
        }
        return [];
      }),
    );
  }

  adicionar(idPijama: number): Observable<void> {
    return this.httpClient.post<void>(`${this.api}/${idPijama}`, null);
  }

  remover(idPijama: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${idPijama}`);
  }
}
