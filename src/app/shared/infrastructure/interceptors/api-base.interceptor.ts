import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@env/environment';

export const apiBaseInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('api/v1/')) {
    const url = `${environment.apiBaseUrl}/${req.url.slice('api/v1/'.length)}`;
    return next(req.clone({ url }));
  }
  return next(req);
};
