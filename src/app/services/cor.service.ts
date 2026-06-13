import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cor } from '../models/cor.model';

interface CorPage {
  data: Cor[];
}

@Injectable({
  providedIn: 'root',
})
export class CorService {
  private readonly api = 'http://localhost:8080/cores';

  constructor(private httpClient: HttpClient) {}

  findAll(): Observable<Cor[]> {
    return this.httpClient.get<CorPage>(this.api).pipe(
      map(resp => resp.data ?? [])
    );
  }

  findById(id: number): Observable<Cor> {
    return this.httpClient.get<Cor>(`${this.api}/${id}`);
  }

  create(cor: Cor): Observable<Cor> {
    return this.httpClient.post<Cor>(this.api, cor);
  }

  update(cor: Cor): Observable<Cor> {
    return this.httpClient.put<Cor>(`${this.api}/${cor.id}`, cor);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}
