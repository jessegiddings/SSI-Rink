import { Resend } from 'resend';

let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set');
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

interface BookingConfirmationData {
  guestName: string;
  guestEmail: string;
  sessionTypeName: string;
  date: string;
  startTime: string;
  endTime: string;
  numAdults: number;
  numChildren: number;
  isFamily: boolean;
  totalPrice: number;
  bookingId: string;
  qrCodeDataUrl: string;
}

export async function sendBookingConfirmation(data: BookingConfirmationData) {
  const resend = getResend();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const priceDisplay = data.totalPrice === 0 ? 'Free' : `$${data.totalPrice.toFixed(2)} CAD`;
  const guestsDisplay = [
    data.isFamily ? 'Family booking' : null,
    data.numAdults > 0 ? `${data.numAdults} adult${data.numAdults !== 1 ? 's' : ''}` : null,
    data.numChildren > 0 ? `${data.numChildren} child${data.numChildren !== 1 ? 'ren' : ''}` : null,
  ]
    .filter(Boolean)
    .join(', ');

  await resend.emails.send({
    from: 'SSI Ice Rink <noreply@saltspringisland.com>',
    to: data.guestEmail,
    subject: `Booking Confirmed — ${data.sessionTypeName} on ${data.date}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <div style="background: #0A1628; color: white; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 20px;">Booking Confirmed!</h1>
          <p style="margin: 5px 0 0; color: #00A3E0; font-size: 14px;">SSI Ice Rink</p>
        </div>

        <div style="background: #EDF5F9; padding: 20px; border-radius: 0 0 12px 12px;">
          <p style="margin: 0 0 15px;">Hi ${data.guestName},</p>
          <p style="margin: 0 0 20px; color: #666;">Your booking has been confirmed. See you on the ice!</p>

          <div style="background: white; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
            <h3 style="margin: 0 0 10px; color: #0A1628;">${data.sessionTypeName}</h3>
            <p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>Date:</strong> ${data.date}</p>
            <p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>Time:</strong> ${data.startTime} — ${data.endTime}</p>
            <p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>Guests:</strong> ${guestsDisplay}</p>
            <p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>Total:</strong> ${priceDisplay}</p>
          </div>

          <div style="text-align: center; background: white; border-radius: 8px; padding: 15px;">
            <p style="margin: 0 0 10px; font-size: 13px; color: #666;">Show this QR code at check-in:</p>
            <img src="${data.qrCodeDataUrl}" alt="Booking QR Code" style="width: 200px; height: 200px;" />
            <p style="margin: 10px 0 0; font-size: 11px; color: #999;">Booking ID: ${data.bookingId}</p>
          </div>

          <div style="margin-top: 15px; padding: 12px; background: white; border-radius: 8px; font-size: 13px; color: #666;">
            <strong>What to bring:</strong>
            <ul style="margin: 5px 0 0; padding-left: 20px;">
              <li>Warm clothing and gloves</li>
              <li>This email or the QR code on your phone</li>
            </ul>
            <p style="margin: 10px 0 0;">Skate rentals and helmets are included with your booking.</p>
          </div>

          <div style="margin-top: 15px; text-align: center;">
            <a href="${appUrl}/booking/confirmation?id=${data.bookingId}"
               style="display: inline-block; background: #00A3E0; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px;">
              View Booking
            </a>
          </div>

          <p style="margin: 20px 0 0; font-size: 11px; color: #999; text-align: center;">
            Salt Spring Island Community Ice Rink<br>
            Questions? Reply to this email.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendAdminBookingNotification(data: BookingConfirmationData) {
  try {
    const resend = getResend();
    const priceDisplay = data.totalPrice === 0 ? 'Free' : `$${data.totalPrice.toFixed(2)} CAD`;

    await resend.emails.send({
      from: 'SSI Ice Rink <noreply@saltspringisland.com>',
      to: process.env.ADMIN_EMAIL || 'admin@saltspringisland.com',
      subject: `New Booking: ${data.sessionTypeName} — ${data.guestName}`,
      html: `
        <p>New booking received:</p>
        <ul>
          <li><strong>Guest:</strong> ${data.guestName} (${data.guestEmail})</li>
          <li><strong>Session:</strong> ${data.sessionTypeName}</li>
          <li><strong>Date:</strong> ${data.date} ${data.startTime} — ${data.endTime}</li>
          <li><strong>Guests:</strong> ${data.numAdults} adults, ${data.numChildren} children${data.isFamily ? ' (family)' : ''}</li>
          <li><strong>Total:</strong> ${priceDisplay}</li>
          <li><strong>Booking ID:</strong> ${data.bookingId}</li>
        </ul>
      `,
    });
  } catch {
    // Admin notification is best-effort — don't fail the booking
    console.error('Failed to send admin notification');
  }
}
