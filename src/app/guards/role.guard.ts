import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { EcommerceAuthService } from '../services/ecommerce-auth.service';

// Busca os perfis configurados na rota atual ou em alguma rota pai.
function routeRoles(route: ActivatedRouteSnapshot): string[] {
  for (const currentRoute of [...route.pathFromRoot].reverse()) {
    const roles = currentRoute.data['roles'];

    if (Array.isArray(roles)) {
      return roles.filter((role): role is string => typeof role === 'string');
    }
  }

  return [];
}

// Verifica se o usuario autenticado atende aos perfis exigidos pela rota.
function hasRequiredRole(route: ActivatedRouteSnapshot, authService: EcommerceAuthService): boolean {
  const perfil = authService.perfil()?.trim().toLowerCase();
  const roles = routeRoles(route).map((role) => role.trim().toLowerCase());

  if (roles.length === 0) {
    return authService.logado();
  }

  if (!perfil) {
    return false;
  }

  return roles.includes(perfil);
}

// Define o redirecionamento para login quando nao autenticado ou para home quando sem permissao.
function unauthorizedRedirect(route: ActivatedRouteSnapshot, authService: EcommerceAuthService, router: Router) {

  if (!authService.logado()) {
    return router.createUrlTree(['/login'], {
      queryParams: { redirectTo: route.pathFromRoot.map((segment) => segment.url.map((item) => item.path).join('/')).filter(Boolean).join('/') },
    });
  }

  return router.createUrlTree(['/']);
}

// Protege a rota pai aguardando a carga do usuario antes de validar autenticacao e perfil.
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(EcommerceAuthService);
  const router = inject(Router);

  return authService.ensureUsuarioCarregado().pipe(
    map(() => {
      if (hasRequiredRole(route, authService)) {
        return true;
      }

      return unauthorizedRedirect(route, authService, router);
    }),
  );
};

// Aplica a mesma validacao de perfil para cada rota filha da area protegida.
export const roleChildGuard: CanActivateChildFn = (childRoute) => {
  const authService = inject(EcommerceAuthService);
  const router = inject(Router);

  return authService.ensureUsuarioCarregado().pipe(
    map(() => {
      if (hasRequiredRole(childRoute, authService)) {
        return true;
      }

      return unauthorizedRedirect(childRoute, authService, router);
    }),
  );
};