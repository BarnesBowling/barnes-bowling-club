import { MEMBERS } from './handicapData';

export interface MemberNumberEntry {
  surname: string;
  firstname: string;
  memberNumber: string;
}

const sorted = [...MEMBERS].sort((a, b) => {
  const s = a.surname.localeCompare(b.surname, 'en');
  return s !== 0 ? s : a.firstname.localeCompare(b.firstname, 'en');
});

export const MEMBER_NUMBERS: MemberNumberEntry[] = sorted.map((m, i) => ({
  surname:      m.surname,
  firstname:    m.firstname,
  memberNumber: `BBC${m.firstname[0].toUpperCase()}${m.surname[0].toUpperCase()}${200 + i}`,
}));

export function getMemberNumber(firstname: string, surname: string): string | null {
  const first = firstname.trim().toLowerCase();
  const last  = surname.trim().toLowerCase();
  const entry = MEMBER_NUMBERS.find(
    m => m.firstname.toLowerCase() === first && m.surname.toLowerCase() === last
  );
  return entry?.memberNumber ?? null;
}
