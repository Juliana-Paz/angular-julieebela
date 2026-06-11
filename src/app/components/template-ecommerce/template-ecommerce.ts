import { ChangeDetectionStrategy, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EcommerceAuthService } from '../../services/ecommerce-auth.service';
import { CarrinhoService } from '../../services/carrinho.service';

@Component({
  selector: 'app-template-ecommerce',
  imports: [RouterOutlet, RouterLink, FormsModule,
            MatButtonModule, MatIconModule, MatMenuModule, MatBadgeModule],
  templateUrl: './template-ecommerce.html',
  styleUrl: './template-ecommerce.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateEcommerce {
  private readonly authService = inject(EcommerceAuthService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);
  readonly carrinhoService = inject(CarrinhoService);

  readonly logado = this.authService.logado;
  readonly nomeUsuario = this.authService.nomeUsuario;
  readonly perfil = this.authService.perfil;
  readonly quantidadeCarrinho = this.carrinhoService.quantidadeTotal;

  @ViewChild('buscaInput') buscaInputRef!: ElementRef<HTMLInputElement>;

  buscaAberta = false;
  termoBusca = '';

  login(): void { this.router.navigate(['/login']); }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  irPerfil(): void { this.router.navigate(['/perfil']); }

  toggleBusca(): void {
    this.buscaAberta = !this.buscaAberta;
    if (this.buscaAberta) {
      setTimeout(() => this.buscaInputRef?.nativeElement?.focus(), 50);
    }
  }

  buscar(): void {
    if (this.termoBusca.trim()) {
      this.router.navigate(['/'], { queryParams: { busca: this.termoBusca } });
      this.buscaAberta = false;
    }
  }

  emBreve(): void {
    this.snack.open('Em breve!', '', { duration: 2500, verticalPosition: 'top' });
  }
}
