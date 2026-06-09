import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente.model';
import { Endereco } from '../models/endereco.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly api = 'http://localhost:8080/clientes';

  constructor(private httpClient: HttpClient) {}

  cadastrar(cliente: Record<string, unknown>): Observable<Cliente> {
    return this.httpClient.post<Cliente>(this.api, cliente);
  }

  getMeuPerfil(): Observable<Cliente> {
    return this.httpClient.get<Cliente>(`${this.api}/me`);
  }

  atualizarPerfil(cliente: Partial<Cliente>): Observable<Cliente> {
    return this.httpClient.put<Cliente>(`${this.api}/me`, cliente);
  }

  alterarSenha(payload: { senhaAtual: string; novaSenha: string }): Observable<void> {
    return this.httpClient.patch<void>(`${this.api}/me/senha`, payload);
  }

  adicionarEndereco(endereco: Partial<Endereco>): Observable<Cliente> {
    return this.httpClient.post<Cliente>(`${this.api}/me/enderecos`, endereco);
  }

  atualizarEndereco(index: number, endereco: Partial<Endereco>): Observable<Cliente> {
    return this.httpClient.patch<Cliente>(`${this.api}/me/enderecos/${index}`, endereco);
  }

  removerEndereco(index: number): Observable<Cliente> {
    return this.httpClient.delete<Cliente>(`${this.api}/me/enderecos/${index}`);
  }
}
