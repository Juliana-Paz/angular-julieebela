import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { EcommerceAuthService } from '../services/ecommerce-auth.service';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(EcommerceAuthService);
  const router = inject(Router);
  const isBackendRequest = req.url.startsWith('http://localhost:8080');
  const isLoginRequest = req.url === 'http://localhost:8080/auth/login';

  if (!isBackendRequest || isLoginRequest) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        void router.navigate(['/login']);
      }

      if (error.status === 403) {
        void router.navigate(['/']);
      }

      return throwError(() => error);
    }),
  );
};