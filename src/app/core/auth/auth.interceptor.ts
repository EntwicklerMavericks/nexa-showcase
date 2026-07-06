// =============================================================================
// AuthInterceptor — Injects Bearer token and handles 401 with refresh
// Uses shareReplay(1) to serialize concurrent refresh calls and prevent
// the race condition where multiple 401s trigger redundant refresh requests.
// =============================================================================

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, shareReplay, finalize } from 'rxjs';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { RefreshResponse } from './auth.service';

// Shared observable for ongoing refresh. All concurrent 401s subscribe to the
// same stream instead of each triggering a separate /refresh call.
let refreshTokenInProgress$: Observable<RefreshResponse> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  // Skip auth header for login/register/refresh
  if (
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh')
  ) {
    return next(req);
  }

  // Clone request with auth header
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // If a refresh is not already in progress, start one
      if (!refreshTokenInProgress$) {
        refreshTokenInProgress$ = authService.refreshToken().pipe(
          shareReplay(1), // All concurrent subscribers share the same response
          finalize(() => {
            refreshTokenInProgress$ = null;
          }),
        );
      }

      // All 401 requests (current and any concurrent ones) subscribe here
      return refreshTokenInProgress$.pipe(
        switchMap((response) => {
          authService.handleRefreshSuccess(response);
          const retryReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${response.accessToken}`,
            },
          });
          return next(retryReq);
        }),
        catchError((refreshError) => {
          authService.logout();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
