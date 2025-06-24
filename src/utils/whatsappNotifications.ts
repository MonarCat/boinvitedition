
export interface SalonBookingDetails {
  salonName: string;
  serviceName: string;
  price: number;
  duration: number;
  time: string;
  deposit: number;
  paymentLink?: string;
}

export interface EventTicketDetails {
  name: string;
  date: string;
  location: string;
  ticketType: string;
  quantity: number;
  qrCodeUrl?: string;
}

export function sendSalonWhatsAppConfirmation(clientPhone: string, bookingDetails: SalonBookingDetails) {
  const message = `📅 *Booking Confirmed*\n\n` +
    `Salon: ${bookingDetails.salonName}\n` +
    `Service: ${bookingDetails.serviceName} (KSh ${bookingDetails.price})\n` +
    `Duration: ${bookingDetails.duration} mins\n` +
    `Time: ${new Date(bookingDetails.time).toLocaleString()}\n` +
    `Deposit Required: KSh ${bookingDetails.deposit}\n\n` +
    (bookingDetails.paymentLink ? `Pay deposit: ${bookingDetails.paymentLink}\n\n` : '') +
    `Thank you for choosing our salon!`;

  const whatsappUrl = `https://wa.me/${clientPhone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

export function sendEventWhatsAppTicket(buyerPhone: string, eventDetails: EventTicketDetails) {
  const message = `🎟️ *Your Ticket for ${eventDetails.name}*\n\n` +
    `Date: ${eventDetails.date}\n` +
    `Location: ${eventDetails.location}\n` +
    `Ticket Type: ${eventDetails.ticketType} (${eventDetails.quantity}x)\n\n` +
    (eventDetails.qrCodeUrl ? `Show QR at entrance:\n${eventDetails.qrCodeUrl}` : 'QR code will be sent separately');

  const whatsappUrl = `https://wa.me/${buyerPhone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

export function sendBusinessWhatsAppMessage(businessPhone: string = '254769829304', message: string) {
  const whatsappUrl = `https://wa.me/${businessPhone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}
