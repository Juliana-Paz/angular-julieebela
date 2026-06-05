import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pijama } from '../models/pijama.model';

@Injectable({
  providedIn: 'root',
})
export class PijamaService {
  private readonly api = 'http://localhost:8080/pijamas';

  constructor(private httpClient: HttpClient) {}

  findAll(page?: number, pageSize?: number): Observable<Pijama[]> {
    let params = {};
    if (page !== undefined && pageSize !== undefined) {
      params = { page: page.toString(), pageSize: pageSize.toString() };
    }
    return this.httpClient.get<Pijama[]>(this.api, { params });
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.api}/count`);
  }

  findById(id: number): Observable<Pijama> {
    return this.httpClient.get<Pijama>(`${this.api}/${id}`);
  }

  create(pijama: FormData): Observable<Pijama> {
    return this.httpClient.post<Pijama>(this.api, pijama);
  }

  update(id: number, pijama: FormData): Observable<Pijama> {
    return this.httpClient.put<Pijama>(`${this.api}/${id}`, pijama);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}
