// =============================================================================
// ResponseInterceptor — Unwraps ApiResponse envelope
// =============================================================================

import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs';

export const responseInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map((event) => {
      if (event instanceof HttpResponse && event.body) {
        const body = event.body as any;
        if (body.success !== undefined) {
          // Return only the 'data' part of the ApiResponse
          return event.clone({ body: body.data });
        }
      }
      return event;
    })
  );
};
