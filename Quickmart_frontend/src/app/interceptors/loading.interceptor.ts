import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize, Observable } from 'rxjs';
import { LoadingService } from '../Services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const loadingService = inject(LoadingService);

  if (req.headers.get('x-skip-loading') === 'true') {
    const cleanedRequest = req.clone({
      headers: req.headers.delete('x-skip-loading')
    });
    return next(cleanedRequest);
  }

  loadingService.start();
  return next(req).pipe(finalize(() => loadingService.stop()));
};
