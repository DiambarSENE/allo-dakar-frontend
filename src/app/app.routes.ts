import { Routes } from '@angular/router';

import { authGuard, adminGuard, customerServiceGuard, driverGuard, passengerGuard } from './core/guards/auth.guard';

/**
 * §55/§56 : toutes les routes "produit" vivent sous PublicLayoutComponent (header adaptatif +
 * footer) — y compris celles qui nécessitent une connexion (réservation, détail réservation),
 * puisqu'elles restent des pages de navigation classique, pas un dashboard applicatif séparé.
 * Les dashboards passager/conducteur/admin (AuthenticatedLayout/AdminLayout) ne sont pas encore
 * implémentés — voir README §Roadmap ; ne pas ajouter de route pointant vers un composant
 * inexistant (§117).
 *
 * Chaque feature est chargée en lazy loading (loadComponent) — aucun NgModule (§2).
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/public-layout/public-layout.component').then((m) => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/pages/home/home.page').then((m) => m.HomePage),
        title: 'Allo Dakar — Covoiturage au Sénégal',
      },
      {
        path: 'trips',
        loadComponent: () =>
          import('./features/trips/pages/trip-search/trip-search.page').then((m) => m.TripSearchPage),
        title: 'Rechercher un trajet — Allo Dakar',
      },
      {
        path: 'trips/:id',
        loadComponent: () =>
          import('./features/trips/pages/trip-detail/trip-detail.page').then((m) => m.TripDetailPage),
        title: 'Détail du trajet — Allo Dakar',
      },
      {
        path: 'booking-confirmation/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/bookings/pages/booking-confirmation/booking-confirmation.page').then(
            (m) => m.BookingConfirmationPage,
          ),
        title: 'Réservation confirmée — Allo Dakar',
      },
      {
        path: 'bookings/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/bookings/pages/booking-detail/booking-detail.page').then(
            (m) => m.BookingDetailPage,
          ),
        title: 'Ma réservation — Allo Dakar',
      },
      {
        path: 'access-denied',
        loadComponent: () =>
          import('./features/auth/pages/access-denied/access-denied.page').then((m) => m.AccessDeniedPage),
        title: 'Accès refusé — Allo Dakar',
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/authenticated-layout/authenticated-layout.component').then(
        (m) => m.AuthenticatedLayoutComponent,
      ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
        title: 'Tableau de bord — Allo Dakar',
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/pages/profile/profile.page').then((m) => m.ProfilePage),
        title: 'Mon profil — Allo Dakar',
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/payments/pages/payments-list/payments-list.page').then((m) => m.PaymentsListPage),
        title: 'Mes paiements — Allo Dakar',
      },
      {
        path: 'passenger',
        canActivate: [passengerGuard],
        loadComponent: () =>
          import('./features/passenger/pages/passenger-space/passenger-space.page').then(
            (m) => m.PassengerSpacePage,
          ),
        title: 'Mon espace passager — Allo Dakar',
      },
      {
        path: 'passenger/bookings',
        canActivate: [passengerGuard],
        loadComponent: () =>
          import('./features/passenger/pages/bookings-list/bookings-list.page').then(
            (m) => m.PassengerBookingsListPage,
          ),
        title: 'Mes réservations — Allo Dakar',
      },
      {
        path: 'driver',
        canActivate: [driverGuard],
        loadComponent: () =>
          import('./features/driver/pages/driver-space/driver-space.page').then((m) => m.DriverSpacePage),
        title: 'Mon espace conducteur — Allo Dakar',
      },
      {
        path: 'driver/trips',
        canActivate: [driverGuard],
        loadComponent: () =>
          import('./features/driver/pages/trips-list/trips-list.page').then((m) => m.DriverTripsListPage),
        title: 'Mes trajets — Allo Dakar',
      },
      {
        path: 'driver/bookings',
        canActivate: [driverGuard],
        loadComponent: () =>
          import('./features/driver/pages/bookings-received/bookings-received.page').then(
            (m) => m.DriverBookingsReceivedPage,
          ),
        title: 'Réservations reçues — Allo Dakar',
      },
      {
        path: 'driver/trips/new',
        canActivate: [driverGuard],
        loadComponent: () => import('./features/driver/pages/trip-form/trip-form.page').then((m) => m.TripFormPage),
        title: 'Publier un trajet — Allo Dakar',
      },
      {
        path: 'driver/trips/:id/edit',
        canActivate: [driverGuard],
        loadComponent: () => import('./features/driver/pages/trip-form/trip-form.page').then((m) => m.TripFormPage),
        title: 'Modifier le trajet — Allo Dakar',
      },
      {
        path: 'driver/vehicles',
        canActivate: [driverGuard],
        loadComponent: () =>
          import('./features/driver/pages/vehicles/vehicles.page').then((m) => m.DriverVehiclesPage),
        title: 'Mes véhicules — Allo Dakar',
      },
      {
        path: 'driver/verification',
        canActivate: [driverGuard],
        loadComponent: () =>
          import('./features/driver/pages/verification/verification.page').then((m) => m.DriverVerificationPage),
        title: 'Vérification conducteur — Allo Dakar',
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/pages/notification-center/notification-center.page').then(
            (m) => m.NotificationCenterPage,
          ),
        title: 'Notifications — Allo Dakar',
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/pages/report-list/report-list.page').then((m) => m.ReportListPage),
        title: 'Mes signalements — Allo Dakar',
      },
      {
        path: 'reports/new',
        loadComponent: () =>
          import('./features/reports/pages/report-form/report-form.page').then((m) => m.ReportFormPage),
        title: 'Nouveau signalement — Allo Dakar',
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./layout/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/pages/admin-dashboard/admin-dashboard.page').then((m) => m.AdminDashboardPage),
        title: 'Administration — Allo Dakar',
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/pages/users-list/users-list.page').then((m) => m.AdminUsersListPage),
        title: 'Utilisateurs — Administration',
      },
      {
        path: 'verifications',
        loadComponent: () =>
          import('./features/admin/pages/verifications-list/verifications-list.page').then(
            (m) => m.AdminVerificationsListPage,
          ),
        title: 'Vérifications conducteurs — Administration',
      },
      {
        path: 'trips',
        loadComponent: () =>
          import('./features/admin/pages/trips-list/trips-list.page').then((m) => m.AdminTripsListPage),
        title: 'Trajets — Administration',
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/admin/pages/bookings-list/bookings-list.page').then((m) => m.AdminBookingsListPage),
        title: 'Réservations — Administration',
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/admin/pages/payments-list/payments-list.page').then((m) => m.AdminPaymentsListPage),
        title: 'Paiements — Administration',
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/admin/pages/reports-list/reports-list.page').then((m) => m.AdminReportsListPage),
        title: 'Signalements — Administration',
      },
    ],
  },
  {
    path: 'customer-service',
    canActivate: [customerServiceGuard],
    loadComponent: () =>
      import('./layout/customer-service-layout/customer-service-layout.component').then(
        (m) => m.CustomerServiceLayoutComponent,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/customer-service/pages/cs-dashboard/cs-dashboard.page').then((m) => m.CsDashboardPage),
        title: 'Service client — Allo Dakar',
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/customer-service/pages/cs-users/cs-users.page').then((m) => m.CsUsersPage),
        title: 'Utilisateurs — Service client',
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/customer-service/pages/cs-bookings/cs-bookings.page').then((m) => m.CsBookingsPage),
        title: 'Réservations — Service client',
      },
      {
        path: 'trips',
        loadComponent: () =>
          import('./features/customer-service/pages/cs-trips/cs-trips.page').then((m) => m.CsTripsPage),
        title: 'Trajets — Service client',
      },
      {
        path: 'disputes',
        loadComponent: () =>
          import('./features/customer-service/pages/cs-disputes/cs-disputes.page').then((m) => m.CsDisputesPage),
        title: 'Litiges — Service client',
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./features/auth/pages/not-found/not-found.page').then((m) => m.NotFoundPage),
    title: 'Page introuvable — Allo Dakar',
  },
];
