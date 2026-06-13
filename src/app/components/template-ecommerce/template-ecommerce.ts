import { ChangeDetectionStrategy, Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EcommerceAuthService } from '../../services/ecommerce-auth.service';
import { CarrinhoService } from '../../services/carrinho.service';
import { EcommerceFooter } from './footer/footer';

@Component({
  selector: 'app-template-ecommerce',
  imports: [RouterOutlet, RouterLink, FormsModule, MatIconModule, MatTooltipModule, EcommerceFooter],
  templateUrl: './template-ecommerce.html',
  styleUrl: './template-ecommerce.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateEcommerce implements OnInit {
  private readonly authService = inject(EcommerceAuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snack = inject(MatSnackBar);
  private readonly carrinhoService = inject(CarrinhoService);

  termoBusca = '';
  readonly categoriaAtiva = signal('');
  readonly scrolled = signal(false);
  perfilAberto = false;

  get usuarioLogado(): boolean {
    return this.authService.logado();
  }

  get nomeUsuario(): string {
    return this.authService.nomeUsuario() ?? '';
  }

  get inicialUsuario(): string {
    const nome = this.authService.nomeUsuario() ?? '';
    return nome.split(' ')[0]?.[0]?.toUpperCase() ?? '?';
  }

  get totalItensCarrinho(): number {
    return this.carrinhoService.quantidadeTotal();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 10);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    if (!(e.target as HTMLElement).closest('.perfil-area')) {
      this.perfilAberto = false;
    }
  }

  togglePerfil(event: MouseEvent): void {
    event.stopPropagation();
    this.perfilAberto = !this.perfilAberto;
  }

  irPara(rota: string): void {
    this.perfilAberto = false;
    this.router.navigate([rota]);
  }

  irParaPedidos(): void {
    this.perfilAberto = false;
    this.router.navigate(['/perfil'], { queryParams: { aba: 3 } });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.categoriaAtiva.set(params.get('categoria') ?? '');
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  buscar(): void {
    if (this.termoBusca.trim()) {
      this.router.navigate(['/'], { queryParams: { busca: this.termoBusca } });
    }
  }

  emBreve(): void {
    this.snack.open('Em breve!', '', { duration: 2500, verticalPosition: 'top' });
  }


}
