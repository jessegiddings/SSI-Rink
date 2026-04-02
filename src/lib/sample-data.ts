// Sample data for development/demo when Supabase is not configured
import { SessionType, Session } from './types';
import { format, addDays, startOfWeek } from 'date-fns';

export const sampleSessionTypes: SessionType[] = [
  {
    id: '1',
    name: 'Open Skate — General',
    duration_min: 90,
    default_capacity: 20,
    default_price_adult: 7.0,
    default_price_child: 5.0,
    default_price_family: 20.0,
    color_hex: '#00A3E0',
    description: 'General open skating for all ages. Price includes skate rental and helmet.',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'After-School Skate',
    duration_min: 90,
    default_capacity: 15,
    default_price_adult: 5.0,
    default_price_child: 5.0,
    default_price_family: null,
    color_hex: '#10B981',
    description: 'Discounted after-school skating program for students.',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Family Skate',
    duration_min: 90,
    default_capacity: 20,
    default_price_adult: null,
    default_price_child: null,
    default_price_family: 20.0,
    color_hex: '#0D9488',
    description: 'Dedicated family skating time. $20 per family regardless of size.',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'KidSport Free Skate',
    duration_min: 90,
    default_capacity: 20,
    default_price_adult: 0.0,
    default_price_child: 0.0,
    default_price_family: 0.0,
    color_hex: '#F59E0B',
    description: 'Free skating for kids, subsidized by KidSport. Equipment provided.',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Senior Skate',
    duration_min: 60,
    default_capacity: 15,
    default_price_adult: 5.0,
    default_price_child: null,
    default_price_family: null,
    color_hex: '#7C3AED',
    description: 'Relaxed skating session for seniors. Gentle pace, great company.',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Private Rental',
    duration_min: 120,
    default_capacity: 1,
    default_price_adult: 150.0,
    default_price_child: null,
    default_price_family: null,
    color_hex: '#D4A843',
    description: 'Exclusive rink rental. 1-2 hours available. Contact us for details.',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'Birthday Party',
    duration_min: 120,
    default_capacity: 1,
    default_price_adult: 250.0,
    default_price_child: null,
    default_price_family: null,
    color_hex: '#EC4899',
    description: 'Birthday party package includes exclusive rink time, setup, and clean-up.',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '8',
    name: 'Stick & Puck',
    duration_min: 60,
    default_capacity: 10,
    default_price_adult: 10.0,
    default_price_child: 10.0,
    default_price_family: null,
    color_hex: '#E84855',
    description: 'Bring your stick and puck! Helmets required. No body checking.',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

function makeSession(
  id: string,
  typeIndex: number,
  dayOffset: number,
  startHour: number,
  startMin: number,
  spotsRemaining?: number
): Session {
  const sessionType = sampleSessionTypes[typeIndex];
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const date = addDays(weekStart, dayOffset);
  const endMinutes = startHour * 60 + startMin + sessionType.duration_min;
  const endHour = Math.floor(endMinutes / 60);
  const endMin = endMinutes % 60;
  const spots = spotsRemaining ?? sessionType.default_capacity;

  return {
    id,
    session_type_id: sessionType.id,
    date: format(date, 'yyyy-MM-dd'),
    start_time: `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}:00`,
    end_time: `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}:00`,
    capacity: sessionType.default_capacity,
    spots_remaining: spots,
    price_override_adult: null,
    price_override_child: null,
    price_override_family: null,
    status: spots === 0 ? 'full' : 'active',
    notes: null,
    created_at: new Date().toISOString(),
    session_type: sessionType,
  };
}

export const sampleSessions: Session[] = [
  // Monday (day 0)
  makeSession('s1', 0, 0, 10, 0),       // Open Skate 10:00
  makeSession('s2', 1, 0, 15, 30),       // After-School 15:30
  makeSession('s3', 7, 0, 18, 0),        // Stick & Puck 18:00
  // Tuesday (day 1)
  makeSession('s4', 4, 1, 10, 0),        // Senior Skate 10:00
  makeSession('s5', 0, 1, 13, 0),        // Open Skate 13:00
  makeSession('s6', 1, 1, 15, 30),       // After-School 15:30
  // Wednesday (day 2)
  makeSession('s7', 3, 2, 10, 0),        // KidSport 10:00
  makeSession('s8', 0, 2, 13, 0, 14),    // Open Skate 13:00 (6 booked)
  makeSession('s9', 7, 2, 18, 0),        // Stick & Puck 18:00
  // Thursday (day 3)
  makeSession('s10', 4, 3, 10, 0),       // Senior Skate 10:00
  makeSession('s11', 2, 3, 13, 0),       // Family Skate 13:00
  makeSession('s12', 1, 3, 15, 30),      // After-School 15:30
  // Friday (day 4)
  makeSession('s13', 0, 4, 10, 0),       // Open Skate 10:00
  makeSession('s14', 0, 4, 13, 0),       // Open Skate 13:00
  makeSession('s15', 7, 4, 18, 0, 3),    // Stick & Puck 18:00 (almost full)
  // Saturday (day 5)
  makeSession('s16', 0, 5, 10, 0),       // Open Skate 10:00
  makeSession('s17', 2, 5, 13, 0),       // Family Skate 13:00
  makeSession('s18', 0, 5, 15, 0, 0),    // Open Skate 15:00 (FULL)
  makeSession('s19', 7, 5, 18, 0),       // Stick & Puck 18:00
  // Sunday (day 6)
  makeSession('s20', 2, 6, 10, 0),       // Family Skate 10:00
  makeSession('s21', 0, 6, 13, 0),       // Open Skate 13:00
  makeSession('s22', 3, 6, 15, 0),       // KidSport 15:00
];
