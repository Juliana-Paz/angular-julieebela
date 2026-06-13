import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { EcommerceAuthService } from '../../services/ecommerce-auth.service';
import { CarrinhoService } from '../../services/carrinho.service';

@Component({
  selector: 'app-template-auth',
  imports: [RouterOutlet, RouterLink, MatIconModule],
  templateUrl: './template-auth.html',
  styleUrl: './template-auth.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateAuth {
  private readonly authService = inject(EcommerceAuthService);
  private readonly carrinhoService = inject(CarrinhoService);
  private readonly router = inject(Router);

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

  get quantidadeCarrinho(): number {
    return this.carrinhoService.quantidadeTotal();
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

  sair(): void {
    this.perfilAberto = false;
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
