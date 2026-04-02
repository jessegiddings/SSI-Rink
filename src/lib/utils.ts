import { Session, SessionType } from './types';

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return minutes === 0 ? `${displayHour} ${period}` : `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function formatPrice(price: number | null): string {
  if (price === null) return '';
  if (price === 0) return 'Free';
  return `$${price.toFixed(0)}`;
}

export function getSessionPrice(session: Session, sessionType: SessionType): string {
  const adultPrice = session.price_override_adult ?? sessionType.default_price_adult;
  const childPrice = session.price_override_child ?? sessionType.default_price_child;
  const familyPrice = session.price_override_family ?? sessionType.default_price_family;

  if (familyPrice !== null && adultPrice === null && childPrice === null) {
    return formatPrice(familyPrice) + '/family';
  }

  if (adultPrice !== null && adultPrice === 0) {
    return 'Free';
  }

  if (adultPrice !== null) {
    return formatPrice(adultPrice);
  }

  return '';
}

export function getSessionTypeForSession(
  session: Session,
  sessionTypes: SessionType[]
): SessionType | undefined {
  if (session.session_type) return session.session_type;
  return sessionTypes.find((st) => st.id === session.session_type_id);
}
