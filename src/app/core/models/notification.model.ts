// NotificationController expose directement l'entité Notification (pas de DTO dédié pour
// l'instant côté backend — voir commentaire dans NotificationController.java). On ne modélise
// ici que les champs utiles à l'UI ; "recipient" (toujours l'utilisateur courant) est ignoré.

import { NotificationStatus, NotificationType } from './enums';

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  channel: 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH';
  title: string;
  message: string;
  status: NotificationStatus;
  sentAt: string | null; // Instant ISO
  readAt: string | null;
  createdAt: string;
}
