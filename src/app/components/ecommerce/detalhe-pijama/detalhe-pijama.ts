import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Pijama, PijamaVariante } from '../../../models/pijama.model';
import { CarrinhoService } from '../../../services/carrinho.service';
import { ListaDesejosService } from '../../../services/lista-desejos.service';
import { EcommerceAuthService } from '../../../services/ecommerce-auth.service';
import { PijamaEcommerce } from '../ecommerce.types';

@Component({
  selector: 'app-detalhe-pijama',
  imports: [CommonModule, RouterLink, MatIconModule, MatTooltipModule, MatDividerModule],
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

  readonly varianteSelecionada = signal<PijamaVariante | null>(null);
  readonly coresDisponiveis = signal<{ id: number; nome: string; hexadecimal: string }[]>([]);
  readonly tamanhosDaCorSelecionada = signal<PijamaVariante[]>([]);
  readonly corSelecionada = signal<{ id: number; nome: string; hexadecimal: string } | null>(null);
  readonly semCor = signal(false);

  readonly podePedir = computed(() => {
    const v = this.varianteSelecionada();
    return v !== null && v.estoque > 0;
  });

  ngOnInit(): void {
    const p: Pijama = this.route.snapshot.data['pijama'];
    this.pijama.set(p);
    this.inicializarVariantes(p);
  }

  private inicializarVariantes(p: Pijama): void {
    if (!p?.variantes?.length) return;

    const temCor = p.variantes.some(v => v.cor !== null);

    if (temCor) {
      const mapa = new Map<number, { id: number; nome: string; hexadecimal: string }>();
      p.variantes
        .filter(v => v.cor !== null)
        .forEach(v => mapa.set(v.cor!.id, v.cor!));
      this.coresDisponiveis.set(Array.from(mapa.values()));
    } else {
      this.semCor.set(true);
      this.tamanhosDaCorSelecionada.set(p.variantes);
    }
  }

  selecionarCor(cor: { id: number; nome: string; hexadecimal: string }): void {
    this.corSelecionada.set(cor);
    this.varianteSelecionada.set(null);
    const p = this.pijama();
    if (!p?.variantes) return;
    this.tamanhosDaCorSelecionada.set(p.variantes.filter(v => v.cor?.id === cor.id));
  }

  selecionarVariante(variante: PijamaVariante): void {
    if (variante.estoque > 0) {
      this.varianteSelecionada.set(variante);
    }
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
    if (p.variantes?.length && !this.varianteSelecionada()) {
      this.snack.open('Selecione um tamanho antes de adicionar ao carrinho.', 'Fechar', { duration: 3000, verticalPosition: 'top' });
      return;
    }
    this.carrinhoService.adicionar(p as PijamaEcommerce, 1, this.varianteSelecionada() ?? undefined);
    this.snack.open(`${p.nome} adicionado ao carrinho!`, 'Ver carrinho', { duration: 3000, verticalPosition: 'top' })
      .onAction().subscribe(() => this.router.navigate(['/carrinho']));
  }

  comprarAgora(): void {
    const p = this.pijama();
    if (!p) return;
    if (p.variantes?.length && !this.varianteSelecionada()) {
      this.snack.open('Selecione um tamanho antes de continuar.', 'Fechar', { duration: 3000, verticalPosition: 'top' });
      return;
    }
    this.carrinhoService.adicionar(p as PijamaEcommerce, 1, this.varianteSelecionada() ?? undefined);
    if (!this.authService.logado()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }
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
