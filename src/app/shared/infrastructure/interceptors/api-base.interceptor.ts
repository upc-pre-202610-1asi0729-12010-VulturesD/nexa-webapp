import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@env/environment';
import { User } from '@app/iam/domain/model/user.model';

const STORAGE_KEY = 'nexa.session';

function readToken(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const user = raw ? (JSON.parse(raw) as User) : null;
    return user?.token ?? null;
  } catch {
    return null;
  }
}

export const apiBaseInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('api/v1/')) {
    const apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');
    const url = `${apiBaseUrl}/${req.url.slice('api/v1/'.length)}`;
    const token = readToken();
    return next(req.clone({
      url,
      setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    }));
  }
  return next(req);
};
