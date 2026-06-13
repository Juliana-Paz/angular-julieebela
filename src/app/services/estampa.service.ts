import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Estampa } from '../models/estampa.model';

interface EstampaPage {
  data: Estampa[];
}

@Injectable({
  providedIn: 'root',
})
export class EstampaService {
  private readonly api = 'http://localhost:8080/estampas';

  constructor(private httpClient: HttpClient) {}

  findAll(): Observable<Estampa[]> {
    return this.httpClient.get<EstampaPage>(this.api).pipe(
      map(resp => resp.data ?? [])
    );
  }

  findById(id: number): Observable<Estampa> {
    return this.httpClient.get<Estampa>(`${this.api}/${id}`);
  }

  create(estampa: Estampa): Observable<Estampa> {
    return this.httpClient.post<Estampa>(this.api, estampa);
  }

  update(estampa: Estampa): Observable<Estampa> {
    return this.httpClient.put<Estampa>(`${this.api}/${estampa.id}`, estampa);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}
