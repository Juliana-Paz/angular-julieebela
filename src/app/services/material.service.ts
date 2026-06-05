import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Material } from '../models/material.model';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  private readonly api = 'http://localhost:8080/materiais';

  constructor(private httpClient: HttpClient) {}

  findAll(): Observable<Material[]> {
    return this.httpClient.get<Material[]>(this.api);
  }

  findById(id: number): Observable<Material> {
    return this.httpClient.get<Material>(`${this.api}/${id}`);
  }

  create(material: Material): Observable<Material> {
    return this.httpClient.post<Material>(this.api, material);
  }

  update(material: Material): Observable<Material> {
    return this.httpClient.put<Material>(`${this.api}/${material.id}`, material);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}
