/**
 * WhatsApp message builder and deep link generator.
 */

export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  // Strip non-digits
  const cleanPhone = (phoneNumber || "").replace(/\D/g, "");
  const encodedText = encodeURIComponent(message || "");
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function buildGeneralInquiryMessage(venueName: string): string {
  return `Hello ${venueName}, I am interested in visiting and booking your venue for an upcoming celebration. Could you please share more details and available packages?`;
}

export function buildEnquiryConfirmationMessage(
  venueName: string,
  eventType?: string,
  eventDate?: string | null
): string {
  let msg = `Hi ${venueName}! I just submitted an enquiry on your website`;
  if (eventType) {
    msg += ` for a ${eventType}`;
  }
  if (eventDate) {
    msg += ` on ${eventDate}`;
  }
  msg += `. Please let me know how to proceed. Thank you!`;
  return msg;
}
