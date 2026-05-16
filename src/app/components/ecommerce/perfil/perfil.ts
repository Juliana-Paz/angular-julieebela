import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { EcommerceAuthService } from '../../../services/ecommerce-auth.service';

@Component({
  selector: 'app-perfil',
  imports: [MatButtonModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Perfil {
  private readonly authService = inject(EcommerceAuthService);

  readonly usuario = this.authService.usuario;
}
