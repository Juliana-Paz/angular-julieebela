import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/adm/dashboard' },
    { label: 'Pijamas', icon: 'bedroom_baby', route: '/adm/pijamas' },
    { label: 'Categorias', icon: 'category', route: '/adm/categorias' },
    { label: 'Marcas', icon: 'sell', route: '/adm/marcas' },
    { label: 'Cores', icon: 'palette', route: '/adm/cores' },
    { label: 'Materiais', icon: 'texture', route: '/adm/materiais' },
    { label: 'Cupons', icon: 'local_offer', route: '/adm/cupons' },
  ];
}
