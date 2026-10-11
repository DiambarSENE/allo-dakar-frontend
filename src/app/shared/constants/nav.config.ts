import { RoleType } from '../../core/models/enums';
import { IconName } from '../components/icon/icon.component';

export interface NavItem {
  label: string;
  route: string;
  icon: IconName;
  /** Si omis, l'item est visible par tout utilisateur authentifié, quel que soit son rôle. */
  roles?: RoleType[];
  /** Intitulé de groupe affiché dans le menu latéral (les items consécutifs d'un même groupe sont regroupés). */
  section?: string;
}

/**
 * Source UNIQUE de la navigation authentifiée (§88) — ne pas dupliquer cette logique dans
 * plusieurs composants. AuthenticatedLayoutComponent filtre cette liste avec
 * AuthorizationService.hasAnyRole().
 */
export const AUTHENTICATED_NAV: readonly NavItem[] = [
  { label: 'Tableau de bord', route: '/dashboard', icon: 'home' },
  { label: 'Rechercher un trajet', route: '/trips', icon: 'search', section: 'Voyager' },
  { label: 'Mon espace passager', route: '/passenger', icon: 'user', section: 'Voyager', roles: ['PASSENGER'] },
  { label: 'Mes réservations', route: '/passenger/bookings', icon: 'ticket', section: 'Voyager', roles: ['PASSENGER'] },
  { label: 'Mes paiements', route: '/payments', icon: 'wallet', section: 'Voyager', roles: ['PASSENGER'] },
  { label: 'Mon espace conducteur', route: '/driver', icon: 'car', section: 'Conduire', roles: ['DRIVER'] },
  { label: 'Mes trajets', route: '/driver/trips', icon: 'route', section: 'Conduire', roles: ['DRIVER'] },
  { label: 'Réservations reçues', route: '/driver/bookings', icon: 'clipboard', section: 'Conduire', roles: ['DRIVER'] },
  { label: 'Mes véhicules', route: '/driver/vehicles', icon: 'car', section: 'Conduire', roles: ['DRIVER'] },
  { label: 'Vérification', route: '/driver/verification', icon: 'shield', section: 'Conduire', roles: ['DRIVER'] },
  { label: 'Notifications', route: '/notifications', icon: 'bell', section: 'Mon compte' },
  { label: 'Mes avis', route: '/reviews', icon: 'star', section: 'Mon compte' },
  { label: 'Signaler un problème', route: '/reports', icon: 'flag', section: 'Mon compte' },
  { label: 'Contacter le service client', route: '/support', icon: 'headset', section: 'Mon compte' },
  { label: 'Mon profil', route: '/profile', icon: 'user', section: 'Mon compte' },
  { label: 'Administration', route: '/admin', icon: 'key', section: 'Administration', roles: ['ADMIN'] },
  { label: 'Service client', route: '/customer-service', icon: 'headset', section: 'Administration', roles: ['CUSTOMER_SERVICE', 'ADMIN'] },
] as const;

/**
 * Barre de navigation du bas (mobile) : 4-5 accès essentiels selon le rôle. `cta` met l'action
 * principale en avant (ex. publier un trajet pour un conducteur).
 */
export interface BottomNavItem { label: string; route: string; icon: IconName; exact?: boolean; cta?: boolean }

export const PASSENGER_BOTTOM_NAV: readonly BottomNavItem[] = [
  { label: 'Espace', route: '/passenger', icon: 'home', exact: true },
  { label: 'Rechercher', route: '/trips', icon: 'search', cta: true },
  { label: 'Réservations', route: '/passenger/bookings', icon: 'ticket' },
  { label: 'Alertes', route: '/notifications', icon: 'bell' },
  { label: 'Profil', route: '/profile', icon: 'user' },
];

export const DRIVER_BOTTOM_NAV: readonly BottomNavItem[] = [
  { label: 'Espace', route: '/driver', icon: 'home', exact: true },
  { label: 'Trajets', route: '/driver/trips', icon: 'route' },
  { label: 'Publier', route: '/driver/trips/new', icon: 'plus', cta: true },
  { label: 'Réservations', route: '/driver/bookings', icon: 'clipboard' },
  { label: 'Profil', route: '/profile', icon: 'user' },
];
