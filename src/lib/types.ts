export interface SessionType {
  id: string;
  name: string;
  duration_min: number;
  default_capacity: number;
  default_price_adult: number | null;
  default_price_child: number | null;
  default_price_family: number | null;
  color_hex: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Session {
  id: string;
  session_type_id: string;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  spots_remaining: number;
  price_override_adult: number | null;
  price_override_child: number | null;
  price_override_family: number | null;
  status: 'active' | 'cancelled' | 'full';
  notes: string | null;
  created_at: string;
  session_type?: SessionType;
}

export interface Booking {
  id: string;
  session_id: string;
  user_id: string | null;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  num_adults: number;
  num_children: number;
  is_family: boolean;
  total_price: number;
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  stripe_payment_id: string | null;
  qr_code: string | null;
  booked_at: string;
  cancelled_at: string | null;
  session?: Session;
}

export interface SeasonPass {
  id: string;
  user_id: string;
  pass_type: 'individual' | 'family';
  purchase_date: string;
  expiry_date: string;
  stripe_subscription_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PrivateBooking {
  id: string;
  user_id: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  date: string;
  start_time: string;
  end_time: string;
  package_type: '1hr' | '2hr' | 'birthday';
  guest_count: number | null;
  special_requests: string | null;
  deposit_paid: number | null;
  total_price: number | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  stripe_payment_id: string | null;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: 'admin' | 'user';
  created_at: string;
}
