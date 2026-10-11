// Reflète EXACTEMENT web/dtos/payment côté backend. Aucun formulaire bancaire réel : le backend
// n'intègre pas encore de fournisseur de paiement réel (Orange Money, Wave, Stripe...) — voir
// PaymentMethod dans enums.ts. Le frontend ne doit jamais collecter de données bancaires réelles.

import { PaymentMethod, PaymentStatus } from './enums';

export interface PaymentResponse {
  id: string;
  paymentReference: string;
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paidAt: string | null; // Instant ISO
  failureReason: string | null;
}

export interface CreatePaymentRequest {
  bookingId: string;
  paymentMethod: PaymentMethod;
}
