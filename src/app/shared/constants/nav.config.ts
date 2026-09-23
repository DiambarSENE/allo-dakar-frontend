import { RoleType } from '../../core/models/enums';

export interface NavItem {
  label: string;
  route: string;
  /** Si omis, l'item est visible par tout utilisateur authentifié, quel que soit son rôle. */
  roles?: RoleType[];
}

/**
 * Source UNIQUE de la navigation authentifiée (§88) — ne pas dupliquer cette logique dans
 * plusieurs composants. AuthenticatedLayoutComponent filtre cette liste avec
 * AuthorizationService.hasAnyRole().
 */
export const AUTHENTICATED_NAV: readonly NavItem[] = [
  { label: 'Tableau de bord', route: '/dashboard' },
  { label: 'Rechercher un trajet', route: '/trips' },
  { label: 'Mon espace', route: '/passenger', roles: ['PASSENGER'] },
  { label: 'Mes réservations', route: '/passenger/bookings', roles: ['PASSENGER'] },
  { label: 'Mes paiements', route: '/payments', roles: ['PASSENGER'] },
  { label: 'Mon espace', route: '/driver', roles: ['DRIVER'] },
  { label: 'Mes trajets', route: '/driver/trips', roles: ['DRIVER'] },
  { label: 'Réservations reçues', route: '/driver/bookings', roles: ['DRIVER'] },
  { label: 'Mes véhicules', route: '/driver/vehicles', roles: ['DRIVER'] },
  { label: 'Vérification', route: '/driver/verification', roles: ['DRIVER'] },
  { label: 'Notifications', route: '/notifications' },
  { label: 'Signaler un problème', route: '/reports' },
  { label: 'Mon profil', route: '/profile' },
  { label: 'Administration', route: '/admin', roles: ['ADMIN'] },
  { label: 'Service client', route: '/customer-service', roles: ['CUSTOMER_SERVICE', 'ADMIN'] },
] as const;
