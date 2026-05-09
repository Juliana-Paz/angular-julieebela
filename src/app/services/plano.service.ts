import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Plano } from '../models/plano.model';

@Injectable({
  providedIn: 'root',
})
export class PlanoService {

  private readonly api = 'http://localhost:8080/planos';

  constructor(private httpClient: HttpClient) { }

  private createPaginationParams(page?: number, pageSize?: number): HttpParams {
    let params = new HttpParams();

    if (page !== undefined && pageSize !== undefined) {
      params = params.set('page', page.toString()).set('pageSize', pageSize.toString());
    }

    return params;
  }

  //  Buscar todos
  findAll(page?: number, pageSize?: number): Observable<Plano[]> {
    const params = this.createPaginationParams(page, pageSize);
    return this.httpClient.get<Plano[]>(this.api, { params });
  }

  //  Buscar todos (com headers de paginação)
  findAllWithHeaders(page?: number, pageSize?: number): Observable<HttpResponse<Plano[]>> {
    const params = this.createPaginationParams(page, pageSize);
    return this.httpClient.get<Plano[]>(this.api, { params, observe: 'response' });
  }

  //  Buscar por nome
  findByNome(nome: string, page?: number, pageSize?: number): Observable<Plano[]> {
    const params = this.createPaginationParams(page, pageSize);
    return this.httpClient.get<Plano[]>(`${this.api}/search/nome/${encodeURIComponent(nome)}`, { params });
  }

  //  Buscar por nome (com headers de paginação)
  findByNomeWithHeaders(nome: string, page?: number, pageSize?: number): Observable<HttpResponse<Plano[]>> {
    const params = this.createPaginationParams(page, pageSize);
    return this.httpClient.get<Plano[]>(`${this.api}/search/nome/${encodeURIComponent(nome)}`, { params, observe: 'response' });
  }

  count(): Observable<any> {
    return this.httpClient.get<any>(`${this.api}/count`);
  }

  //  Buscar por ID
  findById(id: number): Observable<Plano> {
    return this.httpClient.get<Plano>(`${this.api}/${id}`);
  }

  //  Criar
  create(plano: Plano): Observable<Plano> {
    return this.httpClient.post<Plano>(this.api, plano);
  }

  //  Atualizar
  update(id: number, plano: Plano): Observable<Plano>;
  update(plano: Plano): Observable<Plano>;
  update(idOrPlano: number | Plano, plano?: Plano): Observable<Plano> {
    if (typeof idOrPlano === 'number') {
      return this.httpClient.put<Plano>(`${this.api}/${idOrPlano}`, plano as Plano);
    }

    return this.httpClient.put<Plano>(`${this.api}/${idOrPlano.id}`, idOrPlano);
  }
  //  Deletar
  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }

  //  Download de imagem
  downloadImage(fid: string): Observable<Blob> {
    return this.httpClient.get(`${this.api}/image/download/${encodeURIComponent(fid)}`, {
      responseType: 'blob',
    });
  }

  //  Upload de imagem
  uploadImage(idPlano: number, file: File): Observable<void> {
    const formData = new FormData();
    formData.append('idPlano', idPlano.toString());
    formData.append('file', file);

    return this.httpClient.patch<void>(`${this.api}/image/upload`, formData);
  }

  //  Remover imagem
  deleteImage(fid: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/image/${encodeURIComponent(fid)}`);
  }

}
