import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { DashboardService, DashboardStats } from '../../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    CurrencyPipe,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatButtonModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private readonly service = inject(DashboardService);

  readonly carregando = signal(true);
  readonly erro = signal(false);
  readonly stats = signal<DashboardStats | null>(null);

  readonly colunasVendidos = ['posicao', 'nome', 'totalVendido'];

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set(false);
    this.service.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  get maxReceita(): number {
    const mensal = this.stats()?.receitaMensal;
    if (!mensal?.length) return 1;
    return Math.max(...mensal.map((m) => m.receita)) || 1;
  }

  getAltura(receita: number): number {
    return receita > 0 ? Math.round((receita / this.maxReceita) * 100) : 2;
  }
}
