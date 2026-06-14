import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

const ROUTE_LABELS: Record<string, string> = {
  dashboard:  'Dashboard',
  pijamas:    'Pijamas',
  categorias: 'Categorias',
  marcas:     'Marcas',
  cores:      'Cores',
  materiais:  'Materiais',
  cupons:     'Cupons',
  estados:    'Estados',
  municipios: 'Municípios',
  perfil:     'Meu Perfil',
};

@Component({
  selector: 'app-header',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly router = inject(Router);

  readonly breadcrumb = signal('Dashboard');

  constructor() {
    this.setBreadcrumb(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.setBreadcrumb(e.urlAfterRedirects));
  }

  private setBreadcrumb(url: string): void {
    const segments = url.split('/').filter(Boolean);
    const admIdx = segments.indexOf('adm');
    const section = admIdx >= 0 ? segments[admIdx + 1] : undefined;
    this.breadcrumb.set(ROUTE_LABELS[section ?? ''] ?? 'ADM');
  }
}
