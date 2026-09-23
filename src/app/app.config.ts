import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideAppKeycloak } from './core/config/keycloak.config';
import { authInterceptor, authInterceptorConfigProvider } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    authInterceptorConfigProvider,
    // Doit être fourni AVANT que quoi que ce soit n'injecte Keycloak/AuthorizationService —
    // provideKeycloak s'appuie sur provideAppInitializer en interne pour bloquer le bootstrap
    // le temps du "check-sso" (voir keycloak.config.ts).
    provideAppKeycloak(),
  ],
};
