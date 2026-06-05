import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { PedidoService } from '../../../services/pedido.service';
import { Pedido } from '../../../models/pedido.model';

@Component({
  selector: 'app-pedido-confirmado',
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule, MatDividerModule],
  templateUrl: './pedido-confirmado.html',
  styleUrl: './pedido-confirmado.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidoConfirmado implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly pedidoService = inject(PedidoService);

  readonly pedido = signal<Pedido | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.pedidoService.findById(id).subscribe({
      next: pedido => { this.pedido.set(pedido); this.loading.set(false); },
      error: () => { this.error.set('Pedido não encontrado.'); this.loading.set(false); },
    });
  }
}
