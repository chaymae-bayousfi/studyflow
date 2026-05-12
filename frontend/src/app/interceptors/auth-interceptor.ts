import { HttpInterceptorFn } from '@angular/common/http';

import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('studyflow.token');

  if (token && !req.url.includes('/auth/login')) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  return next(req);
};
