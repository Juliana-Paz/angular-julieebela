import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Pijama } from '../../../models/pijama.model';
import { CarrinhoService } from '../../../services/carrinho.service';
import { ListaDesejosService } from '../../../services/lista-desejos.service';
import { EcommerceAuthService } from '../../../services/ecommerce-auth.service';
import { PijamaEcommerce } from '../ecommerce.types';

@Component({
  selector: 'app-detalhe-pijama',
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule,
            MatChipsModule, MatTooltipModule, MatDividerModule],
  templateUrl: './detalhe-pijama.html',
  styleUrl: './detalhe-pijama.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalhePijama implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly carrinhoService = inject(CarrinhoService);
  private readonly listaDesejosService = inject(ListaDesejosService);
  private readonly authService = inject(EcommerceAuthService);
  private readonly snack = inject(MatSnackBar);

  readonly pijama = signal<Pijama | null>(null);
  readonly activeIndex = signal(0);
  readonly noDesejo = signal(false);
  readonly logado = this.authService.logado;
  readonly imageBase = 'http://localhost:8080/pijamas/imagens/download/';

  ngOnInit(): void {
    const p: Pijama = this.route.snapshot.data['pijama'];
    this.pijama.set(p);
  }

  getImageUrl(index: number): string {
    const p = this.pijama();
    if (!p) return 'https://placehold.co/600x500?text=Pijama';
    const arqs = p.imagens ?? [];
    const arq = arqs[index];
    return arq?.fid ? this.imageBase + encodeURIComponent(arq.fid) : 'https://placehold.co/600x500?text=Pijama';
  }

  get thumbs(): number[] {
    const count = this.pijama()?.imagens?.length ?? 0;
    return Array.from({ length: count }, (_, i) => i);
  }

  nextImage(): void {
    const max = (this.pijama()?.imagens?.length ?? 1) - 1;
    this.activeIndex.update(i => (i >= max ? 0 : i + 1));
  }

  prevImage(): void {
    const max = (this.pijama()?.imagens?.length ?? 1) - 1;
    this.activeIndex.update(i => (i <= 0 ? max : i - 1));
  }

  adicionarCarrinho(): void {
    const p = this.pijama();
    if (!p) return;
    this.carrinhoService.adicionar(p as PijamaEcommerce);
    this.snack.open(`${p.nome} adicionado ao carrinho!`, 'Ver carrinho', { duration: 3000, verticalPosition: 'top' })
      .onAction().subscribe(() => this.router.navigate(['/carrinho']));
  }

  comprarAgora(): void {
    const p = this.pijama();
    if (!p) return;
    this.carrinhoService.adicionar(p as PijamaEcommerce);
    this.router.navigate(['/checkout']);
  }

  toggleDesejos(): void {
    if (!this.logado()) { this.router.navigate(['/login']); return; }
    const p = this.pijama();
    if (!p) return;
    if (this.noDesejo()) {
      this.listaDesejosService.remover(p.id).subscribe({ next: () => this.noDesejo.set(false) });
    } else {
      this.listaDesejosService.adicionar(p.id).subscribe({ next: () => this.noDesejo.set(true) });
    }
  }
}
