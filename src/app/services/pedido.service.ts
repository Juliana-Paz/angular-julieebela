import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pedido } from '../models/pedido.model';

export interface ItemPedidoDto { idPijama: number; quantidade: number; }

export interface EnderecoEntregaDto {
  logradouro: string; numero: string; complemento?: string;
  bairro: string; cep: string; municipio: string; estado: string;
  principal: boolean;
}

export interface CriarPedidoDto {
  itens: ItemPedidoDto[];
  codigoCupom?: string;
  enderecoEntrega: EnderecoEntregaDto;
  idFormaPagamento: number;
}

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly api = 'http://localhost:8080/pedidos';

  constructor(private httpClient: HttpClient) {}

  criar(dto: CriarPedidoDto): Observable<Pedido> {
    console.log('[PedidoService] POST /pedidos →', dto);
    return this.httpClient.post<Pedido>(this.api, dto);
  }

  historico(): Observable<Pedido[]> {
    return this.httpClient.get<Pedido[]>(this.api);
  }

  findById(id: number): Observable<Pedido> {
    return this.httpClient.get<Pedido>(`${this.api}/${id}`);
  }
}
