import { RoleType } from '../../core/models/enums';
import { ROLE_LABELS } from '../constants/labels';

/** « Aminata Diop » → « AD » (jusqu'à deux lettres). */
export function initials(fullName: string | null | undefined): string {
  const parts = (fullName ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const letters = parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0];
  return letters.toUpperCase();
}

export function firstName(fullName: string | null | undefined): string {
  return (fullName ?? '').trim().split(/\s+/)[0] ?? '';
}

const ROLE_PRIORITY: readonly RoleType[] = ['ADMIN', 'CUSTOMER_SERVICE', 'MODERATOR', 'DRIVER', 'PASSENGER'];

/** Libellé du rôle « principal » (le plus élevé) pour l'affichage compact dans la barre latérale. */
export function primaryRoleLabel(roles: readonly RoleType[]): string {
  const role = ROLE_PRIORITY.find((r) => roles.includes(r));
  return role ? ROLE_LABELS[role] : 'Membre';
}
