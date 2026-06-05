import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cupom } from '../models/cupom.model';

@Injectable({
  providedIn: 'root',
})
export class CupomService {
  private readonly api = 'http://localhost:8080/cupons';

  constructor(private httpClient: HttpClient) {}

  findAll(): Observable<Cupom[]> {
    return this.httpClient.get<Cupom[]>(this.api);
  }

  findById(id: number): Observable<Cupom> {
    return this.httpClient.get<Cupom>(`${this.api}/${id}`);
  }

  validar(codigo: string): Observable<Cupom> {
    return this.httpClient.get<Cupom>(`${this.api}/validar/${codigo}`);
  }

  create(cupom: Cupom): Observable<Cupom> {
    return this.httpClient.post<Cupom>(this.api, cupom);
  }

  update(cupom: Cupom): Observable<Cupom> {
    return this.httpClient.put<Cupom>(`${this.api}/${cupom.id}`, cupom);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}
