import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';

const cache = new Map<string, { expiresAt: number; response: HttpResponse<unknown> }>();
const cacheTtlMs = 30000;

export const cacheInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  if (req.method !== 'GET') {
    cache.clear();
    return next(req);
  }

  const cacheControl = req.headers.get('Cache-Control') || '';
  if (cacheControl.includes('no-cache') || cacheControl.includes('no-store')) {
    return next(req);
  }

  const authKey = req.headers.get('Authorization') || '';
  const cacheKey = `${req.urlWithParams}|${authKey}`;
  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return of(cached.response.clone());
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        cache.set(cacheKey, {
          expiresAt: Date.now() + cacheTtlMs,
          response: event.clone()
        });
      }
    })
  );
};
