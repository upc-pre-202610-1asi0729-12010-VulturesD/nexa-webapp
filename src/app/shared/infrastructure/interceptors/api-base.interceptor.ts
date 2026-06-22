import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@env/environment';
import { User } from '@app/iam/domain/model/user.model';

const STORAGE_KEY = 'nexa.session';

function readSession(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export const apiBaseInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('api/v1/')) {
    const apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');
    const url = `${apiBaseUrl}/${req.url.slice('api/v1/'.length)}`;
    const user = readSession();
    const headers: Record<string, string> = {};
    if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;
    if (user?.tenantId) headers['X-Nexa-Tenant-Id'] = String(user.tenantId);
    if (user?.workspaceSlug) headers['X-Nexa-Workspace'] = user.workspaceSlug;
    return next(req.clone({
      url,
      setHeaders: headers,
    }));
  }
  return next(req);
};
