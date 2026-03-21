import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Aluno } from '../models/aluno.model';

@Injectable({
  providedIn: 'root',
})
export class AlunoService {

  private readonly api = 'http://localhost:8080/alunos';

  constructor(private httpClient: HttpClient) { }

  //  Buscar todos
  findAll(page?: number, pageSize?: number): Observable<Aluno[]> {

    let params = {};
    if (page !== undefined && pageSize !== undefined) {
      params = {
        page: page?.toString(),
        pageSize: pageSize?.toString()
      }
    }

    return this.httpClient.get<Aluno[]>(this.api, {params});
  }

  count(): Observable<any> {
    return this.httpClient.get<any>(`${this.api}/count`);
  }

  //  Buscar por ID
  findById(id: any): Observable<Aluno> {
    return this.httpClient.get<Aluno>(`${this.api}/${id}`);
  }
  
  //  Criar
  create(aluno: Aluno): Observable<Aluno> {
    return this.httpClient.post<Aluno>(this.api, aluno);
  }
  
  //  Atualizar
  update(aluno: Aluno): Observable<Aluno> {
    return this.httpClient.put<Aluno>(`${this.api}/${aluno.id}`, aluno);
  }
  //  Deletar
  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}
