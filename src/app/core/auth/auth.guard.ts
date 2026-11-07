import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from '../models/user.model';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const requiredRoles = route.data?.['roles'] as Role[] | undefined;
  if (requiredRoles?.length && !auth.hasRole(...requiredRoles)) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
