import { HttpContext, HttpContextToken } from '@angular/common/http';

/**
 * Certains flux (ex: réservation avec gestion dédiée du 409, voir §30) affichent leur propre
 * message plutôt que le toast générique de errorInterceptor. Utilisation :
 * `http.post(url, body, { context: skipErrorToast() })`.
 */
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

export function skipErrorToast(): HttpContext {
  return new HttpContext().set(SKIP_ERROR_TOAST, true);
}
