import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Regiao } from '../models/regiao.model';

@Injectable({
  providedIn: 'root',
})
export class RegiaoService {
  private readonly api = 'http://localhost:8080/regioes';

  constructor(private httpClient: HttpClient) { }

  //  Buscar todos
  findAll(): Observable<Regiao[]> {
    return this.httpClient.get<Regiao[]>(this.api);
  }

  //  Buscar por ID
  findById(id: number): Observable<Regiao> {
    return this.httpClient.get<Regiao>(`${this.api}/${id}`);
  }
}