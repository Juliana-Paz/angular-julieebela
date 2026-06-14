import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EcommerceAuthService } from '../../../services/ecommerce-auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  readonly authService = inject(EcommerceAuthService);
  private readonly router = inject(Router);

  readonly menuItems = [
    { label: 'Dashboard',  icon: 'grid_view',          route: '/adm/dashboard' },
    { label: 'Pijamas',    icon: 'bedroom_baby',        route: '/adm/pijamas' },
    { label: 'Categorias', icon: 'category',            route: '/adm/categorias' },
    { label: 'Marcas',     icon: 'sell',                route: '/adm/marcas' },
    { label: 'Cores',      icon: 'palette',             route: '/adm/cores' },
    { label: 'Materiais',  icon: 'texture',             route: '/adm/materiais' },
    { label: 'Cupons',     icon: 'confirmation_number', route: '/adm/cupons' },
  ];

  get inicial(): string {
    const nome = this.authService.nomeUsuario();
    return nome ? nome.charAt(0).toUpperCase() : 'A';
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
