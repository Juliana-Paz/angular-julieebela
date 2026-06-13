import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cupom } from '../models/cupom.model';

interface CupomPage {
  data: Cupom[];
}

@Injectable({
  providedIn: 'root',
})
export class CupomService {
  private readonly api = 'http://localhost:8080/cupons';

  constructor(private httpClient: HttpClient) {}

  findAll(): Observable<Cupom[]> {
    return this.httpClient.get<CupomPage>(this.api).pipe(
      map(resp => resp.data ?? [])
    );
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
