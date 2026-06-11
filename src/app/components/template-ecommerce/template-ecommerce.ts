import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EcommerceAuthService } from '../../services/ecommerce-auth.service';
import { CarrinhoService } from '../../services/carrinho.service';

@Component({
  selector: 'app-template-ecommerce',
  imports: [RouterOutlet, RouterLink, FormsModule, MatIconModule, MatMenuModule],
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

  get logado(): boolean {
    return this.authService.logado();
  }

  get nomeUsuario(): string {
    return this.authService.nomeUsuario() ?? '';
  }

  get iniciais(): string {
    const nome = this.authService.nomeUsuario() ?? '';
    return nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();
  }

  get totalItensCarrinho(): number {
    return this.carrinhoService.quantidadeTotal();
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
