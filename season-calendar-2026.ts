export type Category = 'competition' | 'match' | 'social' | 'external' | 'admin' | 'deadline';

export interface CalEvent {
  dayLabel: string;
  dateLabel: string;
  month: string;
  monthOrder: number;
  title: string;
  details?: string;
  category: Category;
  bankHoliday?: boolean;
  tbc?: boolean;
}

export const EVENTS: CalEvent[] = [
  /* ── April ─────────────────────────────────────────── */
  {
    dayLabel: 'Sat', dateLabel: '25', month: 'April', monthOrder: 4,
    title: 'Opening Day',
    details: 'Sun Inn — lunch 12 noon for 12:30 · Raising of the Flag at The Club, 3:00 pm · 2025 Shield Final',
    category: 'competition',
  },

  /* ── May ────────────────────────────────────────────── */
  {
    dayLabel: 'Mon', dateLabel: '4', month: 'May', monthOrder: 5,
    title: 'Murray Johnson Cup',
    details: 'Winner of 2025 Cup vs Winner of 2025 Shield',
    category: 'competition', bankHoliday: true,
  },
  {
    dayLabel: 'Wed', dateLabel: '13', month: 'May', monthOrder: 5,
    title: 'Draw for The Shield, The Cup & The Pairs Competitions',
    details: 'Evening',
    category: 'admin',
  },
  {
    dayLabel: 'Sat', dateLabel: '23', month: 'May', monthOrder: 5,
    title: 'Away Match vs Masonian Club',
    details: 'Afternoon',
    category: 'match',
  },
  {
    dayLabel: 'Mon', dateLabel: '25', month: 'May', monthOrder: 5,
    title: 'Ladies Day',
    category: 'social', bankHoliday: true,
  },
  {
    dayLabel: 'Sun', dateLabel: '31', month: 'May', monthOrder: 5,
    title: 'FISH Open Gardens',
    details: '1–6 pm',
    category: 'external',
  },

  /* ── June ───────────────────────────────────────────── */
  {
    dayLabel: 'Thu', dateLabel: '11', month: 'June', monthOrder: 6,
    title: 'Home Match vs Masonian Club',
    details: '6 pm',
    category: 'match',
  },
  {
    dayLabel: 'Sat', dateLabel: '20', month: 'June', monthOrder: 6,
    title: 'Summer Solstice Social',
    category: 'social', tbc: true,
  },
  {
    dayLabel: 'Sat', dateLabel: '27', month: 'June', monthOrder: 6,
    title: 'Challenge Plus Cup',
    details: '1–5 pm · Open to probationary members and all members with a plus handicap',
    category: 'competition',
  },
  {
    dayLabel: 'Sun', dateLabel: '28', month: 'June', monthOrder: 6,
    title: 'First Round Matches — Cup deadline',
    details: 'Deadline for The Cup first round matches',
    category: 'deadline',
  },

  /* ── July ───────────────────────────────────────────── */
  {
    dayLabel: 'Sun', dateLabel: '5', month: 'July', monthOrder: 7,
    title: 'First Round Matches — Shield deadline',
    details: 'Deadline for The Shield first round matches',
    category: 'deadline',
  },
  {
    dayLabel: 'Sat', dateLabel: '11', month: 'July', monthOrder: 7,
    title: 'Barnes Fair Open Day',
    category: 'external',
  },
  {
    dayLabel: 'Sat', dateLabel: '18', month: 'July', monthOrder: 7,
    title: 'International Day',
    category: 'social', tbc: true,
  },
  {
    dayLabel: 'Tue', dateLabel: '28', month: 'July', monthOrder: 7,
    title: 'Corporate Hire — Hansard',
    details: 'Afternoon',
    category: 'admin',
  },

  /* ── August ─────────────────────────────────────────── */
  {
    dayLabel: 'Sat', dateLabel: '15', month: 'August', monthOrder: 8,
    title: 'Silver Fox Trophy',
    details: '15th or 22nd August (date TBC) · Open to all members who have previously won the Cup or Shield',
    category: 'competition', tbc: true,
  },
  {
    dayLabel: 'Mon', dateLabel: '31', month: 'August', monthOrder: 8,
    title: 'Summer Bank Holiday',
    category: 'social', bankHoliday: true,
  },

  /* ── September ──────────────────────────────────────── */
  {
    dayLabel: 'Sat–Sun', dateLabel: '5–6', month: 'September', monthOrder: 9,
    title: 'Finals of The Competitions',
    details: 'Saturday 5th and Sunday 6th September',
    category: 'competition',
  },

  /* ── October ────────────────────────────────────────── */
  {
    dayLabel: 'Sun', dateLabel: '4', month: 'October', monthOrder: 10,
    title: 'Closing Day',
    category: 'social', tbc: true,
  },

  /* ── November ───────────────────────────────────────── */
  {
    dayLabel: 'Fri', dateLabel: '13', month: 'November', monthOrder: 11,
    title: 'Closing Dinner',
    category: 'social',
  },
  {
    dayLabel: 'Thu', dateLabel: '26', month: 'November', monthOrder: 11,
    title: 'AGM',
    category: 'admin',
  },
];

export const TBC_EVENTS: Omit<CalEvent, 'dayLabel' | 'dateLabel' | 'month' | 'monthOrder'>[] = [
  { title: 'Wrong Bias Fixed Jack Competition', category: 'competition', tbc: true },
];
