import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalPedidos: number;
  receitaTotal: number;
  receitaMesAtual: number;
  pedidosMesAtual: number;
  maisVendidos: { id: number; nome: string; totalVendido: number }[];
  receitaMensal: { mes: string; receita: number; pedidos: number }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly api = 'http://localhost:8080/pedidos/admin';

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.api}/stats`);
  }
}
