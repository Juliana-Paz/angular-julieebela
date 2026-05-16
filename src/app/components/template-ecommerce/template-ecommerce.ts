import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { EcommerceAuthService } from '../../services/ecommerce-auth.service';

@Component({
  selector: 'app-template-ecommerce',
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './template-ecommerce.html',
  styleUrl: './template-ecommerce.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateEcommerce {
  private readonly authService = inject(EcommerceAuthService);
  private readonly router = inject(Router);

  readonly logado = this.authService.logado;
  readonly nomeUsuario = this.authService.nomeUsuario;
  readonly username = this.authService.username;

  login(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  perfil(): void {
    this.router.navigate(['/perfil']);
  }
}
