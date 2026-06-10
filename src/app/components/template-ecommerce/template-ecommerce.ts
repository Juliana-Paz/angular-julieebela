import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { EcommerceAuthService } from '../../services/ecommerce-auth.service';
import { CarrinhoService } from '../../services/carrinho.service';

@Component({
  selector: 'app-template-ecommerce',
  imports: [RouterOutlet, RouterLink,
            MatButtonModule, MatIconModule, MatMenuModule, MatBadgeModule],
  templateUrl: './template-ecommerce.html',
  styleUrl: './template-ecommerce.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateEcommerce {
  private readonly authService = inject(EcommerceAuthService);
  private readonly router = inject(Router);
  readonly carrinhoService = inject(CarrinhoService);

  readonly logado = this.authService.logado;
  readonly nomeUsuario = this.authService.nomeUsuario;
  readonly perfil = this.authService.perfil;
  readonly quantidadeCarrinho = this.carrinhoService.quantidadeTotal;

  login(): void { this.router.navigate(['/login']); }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  irPerfil(): void { this.router.navigate(['/perfil']); }
}
