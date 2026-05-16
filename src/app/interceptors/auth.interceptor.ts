import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { EcommerceAuthService } from '../services/ecommerce-auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(EcommerceAuthService);
  const isBackendRequest = req.url.startsWith('http://localhost:8080');
  const isLoginRequest = req.url === 'http://localhost:8080/auth/login';

  if (!isBackendRequest || isLoginRequest) {
    return next(req);
  }

  const authorization = authService.authorizationValue();

  if (!authorization) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: authorization,
      },
    }),
  );
};