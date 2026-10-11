import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideAppKeycloak } from './core/config/keycloak.config';
import { authInterceptor, authInterceptorConfigProvider } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { provideDataTables, withOptions, withSafeDefaults } from 'ngx-datatables-net';
import { withDefaultStyling } from 'ngx-datatables-net/dt';

// Dates et nombres en français (DatePipe : « lun. 12 oct. », etc.).
registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'fr' },
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ anchorScrolling: 'enabled' })),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideDataTables(
      withDefaultStyling(),
      withSafeDefaults(),
      withOptions({
        searching: true,
        ordering: true,
        paging: true,
        info: true,
        lengthChange: false,
        language: {
          search: "Rechercher :",
          zeroRecords: "Aucun résultat",
          emptyTable: "Aucune donnée disponible",
        },
      }),
    ),
    authInterceptorConfigProvider,
    // Doit être fourni AVANT que quoi que ce soit n'injecte Keycloak/AuthorizationService —
    // provideKeycloak s'appuie sur provideAppInitializer en interne pour bloquer le bootstrap
    // le temps du "check-sso" (voir keycloak.config.ts).
    provideAppKeycloak(),
  ],
};
