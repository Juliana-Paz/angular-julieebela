import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Pijama } from '../models/pijama.model';

interface PijamaPage {
  data: Pijama[];
  total: number;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root',
})
export class PijamaService {
  private readonly api = 'http://localhost:8080/pijamas';

  constructor(private httpClient: HttpClient) {}

  findAll(page?: number, pageSize?: number): Observable<Pijama[]> {
    let params = {};
    if (page !== undefined && pageSize !== undefined) {
      params = { page: page.toString(), size: pageSize.toString() };
    }
    return this.httpClient.get<PijamaPage>(this.api, { params }).pipe(
      map(resp => resp.data ?? [])
    );
  }

  findAllPaged(page: number, pageSize: number, nome?: string): Observable<{ data: Pijama[]; total: number }> {
    const params: Record<string, string> = { page: page.toString(), size: pageSize.toString() };
    if (nome) params['nome'] = nome;
    return this.httpClient.get<PijamaPage>(this.api, { params }).pipe(
      map(resp => ({ data: resp.data ?? [], total: resp.total ?? 0 }))
    );
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

  adicionarImagem(pijamaId: number, formData: FormData): Observable<void> {
    return this.httpClient.patch<void>(`${this.api}/${pijamaId}/imagens/upload`, formData);
  }

  removerImagem(pijamaId: number, fid: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${pijamaId}/imagens/${fid}`);
  }

  reordenarImagens(
    pijamaId: number,
    ordens: { arquivoId: number; ordem: number; capa: boolean }[]
  ): Observable<any> {
    return this.httpClient.patch<any>(`${this.api}/${pijamaId}/imagens/reordenar`, ordens);
  }
}
