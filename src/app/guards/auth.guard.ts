import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { EcommerceAuthService } from '../services/ecommerce-auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(EcommerceAuthService);
  const router = inject(Router);

  return authService.ensureUsuarioCarregado().pipe(
    map(() => {
      if (authService.logado()) {
        return true;
      }

      return router.createUrlTree(['/login'], {
        queryParams: { redirectTo: state.url },
      });
    }),
  );
};