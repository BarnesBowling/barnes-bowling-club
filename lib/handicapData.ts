export const YEARS = [2021, 2022, 2023, 2024, 2025, 2026] as const;

export interface Member {
  surname: string;
  firstname: string;
  h: { [year: number]: number };
}

export const MEMBERS: Member[] = [
  { surname: 'Al-Hamad',       firstname: 'Ahmad',     h: { 2021: 2,  2022: 2,  2023: 2,  2024: 2,  2025: 2,  2026: 2  } },
  { surname: 'Allcorn',        firstname: 'Jan',        h: { 2021: 2,  2022: 2,  2023: 2,  2024: 4,  2025: 4,  2026: 4  } },
  { surname: 'Ballance',       firstname: 'Gareth',     h: { 2021: -4, 2022: -6, 2023: -6, 2024: -6, 2025: -6, 2026: -6 } },
  { surname: 'Bell',           firstname: 'Maggie',     h: { 2021: 0,  2022: 0,  2023: 2,  2024: 2,  2025: 2,  2026: 2  } },
  { surname: 'Bell',           firstname: 'Stephanie',  h: { 2021: 4,  2022: 4,  2023: 4,  2024: 4,  2025: 4,  2026: 4  } },
  { surname: 'Black',          firstname: 'Jeff',       h: {                               2024: 4,  2025: 2,  2026: 2  } },
  { surname: 'Bown',           firstname: 'Andrew',     h: { 2021: -4, 2022: -6, 2023: -6, 2024: -6, 2025: -6, 2026: -6 } },
  { surname: 'Bradley',        firstname: 'Julia',      h: {                                         2026: 6  } },
  { surname: 'Brown',          firstname: 'Anita',      h: {           2022: 4,  2023: 4,  2024: 4,  2025: 4,  2026: 2  } },
  { surname: 'Brown',          firstname: 'Scott',      h: {                                         2025: 6,  2026: 6  } },
  { surname: 'Butt',           firstname: 'Ed',         h: {           2022: 4,  2023: -2, 2024: -4, 2025: -4, 2026: -2 } },
  { surname: 'Chapman',        firstname: 'Roger',      h: { 2021: -4, 2022: -4, 2023: -4, 2024: 0,  2025: 0,  2026: 0  } },
  { surname: 'Clapham',        firstname: 'Andrew',     h: {                                         2025: 6,  2026: 6  } },
  { surname: 'Clapham',        firstname: 'Karen',      h: {                                         2025: 6,  2026: 6  } },
  { surname: 'Clargo',         firstname: 'Jane',       h: { 2021: 2,  2022: 0,  2023: 2,  2024: 2,  2025: 2,  2026: 2  } },
  { surname: 'Clarke',         firstname: 'Colin',      h: { 2021: 0,  2022: -2, 2023: -2, 2024: -2, 2025: -2, 2026: -2 } },
  { surname: 'Cleven',         firstname: 'Andrew',     h: { 2021: -4, 2022: -4, 2023: -4, 2024: -4, 2025: -4, 2026: -4 } },
  { surname: 'Clough',         firstname: 'Simon',      h: { 2021: -6, 2022: -6, 2023: -6, 2024: -6, 2025: -6, 2026: -6 } },
  { surname: 'Coles',          firstname: 'Brian',      h: { 2021: -6, 2022: -6, 2023: -6, 2024: -6, 2025: -6, 2026: -6 } },
  { surname: 'Cox',            firstname: 'Lynne',      h: {                                         2025: 4,  2026: 4  } },
  { surname: 'Crosbie-Smith',  firstname: 'Sarah',      h: {                                         2025: 6,  2026: 2  } },
  { surname: 'Crwys-Williams', firstname: 'Huw',        h: {                                         2025: 6,  2026: 6  } },
  { surname: 'Daly',           firstname: 'Michael',    h: {                                         2025: 6,  2026: 6  } },
  { surname: 'Danciger',       firstname: 'Simon',      h: { 2021: -2, 2022: -4, 2023: -2, 2024: -2, 2025: -2, 2026: -6 } },
  { surname: 'Derry',          firstname: 'Mark',       h: { 2021: 6,  2022: 6,  2023: 6,  2024: 6,  2025: 6,  2026: 6  } },
  { surname: 'Evans',          firstname: 'Alaric',     h: { 2021: -4, 2022: -4, 2023: -6, 2024: -6, 2025: -6, 2026: -6 } },
  { surname: 'Evans',          firstname: 'Alison',     h: {                      2024: 6,  2025: 6,  2026: 6  } },
  { surname: 'Evans',          firstname: 'Brian',      h: { 2021: -4, 2022: -4, 2023: -4, 2024: -2, 2025: -2, 2026: -2 } },
  { surname: 'Evans',          firstname: 'Peter',      h: {                                         2026: 6  } },
  { surname: 'Evans',          firstname: 'Sue',        h: {                                         2026: 6  } },
  { surname: 'Farrimond',      firstname: 'Jennifer',   h: { 2021: 4,  2022: 4,  2023: 4,  2024: 4,  2025: 4,  2026: 4  } },
  { surname: 'Fenn-Smith',     firstname: 'Ed',         h: {                                         2026: 6  } },
  { surname: 'Finch',          firstname: 'Bob',        h: {                                         2026: 6  } },
  { surname: 'Ford',           firstname: 'Roger',      h: { 2021: -4, 2022: -6, 2023: -6, 2024: -6, 2025: -6, 2026: -6 } },
  { surname: 'Fox',            firstname: 'Andrew',     h: { 2021: 6,  2022: 6,  2023: 6,  2024: 4,  2025: 4,  2026: 2  } },
  { surname: 'Frearson',       firstname: 'Jeremy',     h: { 2021: 4,  2022: 0,  2023: 0,  2024: 0,  2025: 0,  2026: -2 } },
  { surname: 'Fugman',         firstname: 'Ulrik',      h: {                                         2026: 6  } },
  { surname: 'Gaskell',        firstname: 'Stephen',    h: { 2021: -2, 2022: -2, 2023: -2, 2024: -2, 2025: -2, 2026: -2 } },
  { surname: 'Greasley',       firstname: 'Tracy',      h: {                                         2025: 6,  2026: 2  } },
  { surname: 'Grimes',         firstname: 'Ginnette',   h: { 2021: -4, 2022: 4,  2023: -4, 2024: -4, 2025: -2, 2026: -2 } },
  { surname: 'Gyngell',        firstname: 'Torquil',    h: { 2021: 4,  2022: 0,  2023: 0,  2024: 0,  2025: 0,  2026: 0  } },
  { surname: 'Haworth',        firstname: 'Philippa',   h: {                                         2026: 6  } },
  { surname: 'Heaton',         firstname: 'Judith',     h: { 2021: -4, 2022: -4, 2023: -4, 2024: -4, 2025: -4, 2026: -4 } },
  { surname: 'Hill',           firstname: 'Kevin',      h: { 2021: 0,  2022: -2, 2023: -2, 2024: -2, 2025: 0,  2026: 0  } },
  { surname: 'Hill',           firstname: 'Natacha',    h: { 2021: 2,  2022: -2, 2023: -2, 2024: -2, 2025: -2, 2026: -2 } },
  { surname: 'Hillman',        firstname: 'Colleen',    h: {           2022: 6,  2023: 6,  2024: 6,  2025: 6,  2026: 6  } },
  { surname: 'Hogarth',        firstname: 'Alistair',   h: {                               2024: 6,  2025: 4,  2026: 4  } },
  { surname: 'Hogg',           firstname: 'Richard',    h: {                                         2025: 6,  2026: 6  } },
  { surname: 'Hunter',         firstname: 'Mark',       h: {                               2024: -2, 2025: -6, 2026: -6 } },
  { surname: 'Jackson',        firstname: 'Mirren',     h: {                                         2026: 6  } },
  { surname: 'Jay',            firstname: 'Gill',       h: {                                         2025: 6,  2026: 6  } },
  { surname: 'Kaye',           firstname: 'Margaret',   h: { 2021: 2,  2022: 2,  2023: 2,  2024: 2,  2025: 4,  2026: 4  } },
  { surname: 'Kent',           firstname: 'Adrian',     h: {                                         2026: 6  } },
  { surname: 'Kinnear',        firstname: 'Jane',       h: { 2021: 4,  2022: 4,  2023: 4,  2024: 4,  2025: 6,  2026: 6  } },
  { surname: 'Knowles',        firstname: 'Geoff',      h: { 2021: -2, 2022: -4, 2023: -4, 2024: -4, 2025: -4, 2026: -4 } },
  { surname: 'Lane',           firstname: 'Andrea',     h: {                                         2025: 6,  2026: 6  } },
  { surname: 'Livingstone',    firstname: 'Ian',        h: { 2021: 0,  2022: 0,  2023: 0,  2024: 0,  2025: 2,  2026: 6  } },
  { surname: 'Mauri',          firstname: 'Fran',       h: { 2021: 4,  2022: 4,  2023: 4,  2024: 4,  2025: 4,  2026: 4  } },
  { surname: 'McDermott',      firstname: 'Michael',    h: {                                         2026: 6  } },
  { surname: 'McGough',        firstname: 'Roger',      h: { 2021: 0,  2022: 0,  2023: 0,  2024: 0,  2025: 0,  2026: 0  } },
  { surname: 'Mitrenas',       firstname: 'Catherine',  h: { 2021: -4, 2022: -4, 2023: -4, 2024: -4, 2025: -2, 2026: -2 } },
  { surname: 'More',           firstname: 'Fausto',     h: {                                         2025: 6,  2026: 2  } },
  { surname: "O'Hanlon",       firstname: 'Terry',      h: { 2021: 6,             2023: 4,  2024: 4,  2025: 4,  2026: 4  } },
  { surname: "O'Hara",         firstname: 'Noel',       h: {                                         2026: 4  } },
  { surname: "O'Keeffe",       firstname: 'Bernard',    h: { 2021: -2, 2022: -4, 2023: -4, 2024: -4, 2025: -6, 2026: -6 } },
  { surname: "O'Keeffe",       firstname: 'Jocelyn',    h: { 2021: 2,  2022: 2,  2023: 4,  2024: 4,  2025: 4,  2026: 4  } },
  { surname: "O'Neill",        firstname: 'Jim',        h: {           2022: 6,  2023: 6,  2024: 6,  2025: 4,  2026: 0  } },
  { surname: 'Papanicola',     firstname: 'Luke',       h: { 2021: -4, 2022: -4, 2023: -4, 2024: -4, 2025: -4, 2026: -4 } },
  { surname: 'Peel',           firstname: 'Danny',      h: {                               2024: 4,  2025: 2,  2026: 0  } },
  { surname: 'Perkins',        firstname: 'Michael',    h: {           2022: 6,  2023: 6,  2024: 6,  2025: 4,  2026: 4  } },
  { surname: 'Pinfold',        firstname: 'Liz',        h: {                                         2025: 6,  2026: 6  } },
  { surname: 'Power',          firstname: 'Fee',        h: { 2021: -2, 2022: -2, 2023: -2, 2024: -2, 2025: -2, 2026: -2 } },
  { surname: 'Priestley',      firstname: 'David',      h: {                                         2026: 4  } },
  { surname: 'Redon',          firstname: 'Stephane',   h: {                                         2026: 6  } },
  { surname: 'Rees',           firstname: 'Venina',     h: { 2021: -6, 2022: -6, 2023: -6, 2024: -6, 2025: -4, 2026: -4 } },
  { surname: 'Rettie',         firstname: 'Giselle',    h: { 2021: 0,             2023: 0,  2024: 0,  2025: 0,  2026: 0  } },
  { surname: 'Rigg',           firstname: 'Andrew',     h: { 2021: 6,  2022: 6,  2023: 6,  2024: 4,  2025: 6,  2026: 6  } },
  { surname: 'Robinson',       firstname: 'Jules',      h: { 2021: 4,  2022: 4,  2023: 4,  2024: 2,  2025: 2,  2026: 2  } },
  { surname: 'Sadlier',        firstname: 'Jon',        h: {           2022: 4,  2023: 4,  2024: 0,  2025: 0,  2026: 0  } },
  { surname: 'Schiller',       firstname: 'Julian',     h: { 2021: 0,  2022: 0,  2023: 0,  2024: 0,  2025: 2,  2026: 2  } },
  { surname: 'Schiller',       firstname: 'Wolfgang',   h: {                                         2026: 6  } },
  { surname: 'Silverwood',     firstname: 'Mark',       h: { 2021: -4, 2022: -4, 2023: -4, 2024: -4, 2025: -4, 2026: -4 } },
  { surname: 'Skinner',        firstname: 'Richard',    h: { 2021: 0,  2022: 0,  2023: 0,  2024: 0,  2025: 0,  2026: 0  } },
  { surname: 'Smith',          firstname: 'Peter',      h: {           2022: 6,  2023: 6,  2024: 6,  2025: 6,  2026: 6  } },
  { surname: 'Smith',          firstname: 'Simon',      h: {                                         2025: 6,  2026: 6  } },
  { surname: 'Spearing',       firstname: 'Peter',      h: { 2021: -4, 2022: -4, 2023: -4, 2024: -4, 2025: -4, 2026: -4 } },
  { surname: 'Steedman',       firstname: 'Hayley',     h: {                               2024: 4,  2025: 4,  2026: 4  } },
  { surname: 'Steedman',       firstname: 'Toby',       h: {                     2023: 0,  2024: -4, 2025: -2, 2026: -2 } },
  { surname: 'Stewart',        firstname: 'Simon',      h: { 2021: 6,  2022: 4,  2023: 4,  2024: 2,  2025: 2,  2026: 2  } },
  { surname: 'Summers',        firstname: 'Gerry',      h: { 2021: -6, 2022: -6, 2023: -6, 2024: -6, 2025: -6, 2026: -6 } },
  { surname: 'Swire',          firstname: 'Gordon',     h: { 2021: -6, 2022: -6, 2023: -6, 2024: -6, 2025: -6, 2026: -6 } },
  { surname: 'Talbot',         firstname: 'Geraldine',  h: {                                         2026: 6  } },
  { surname: 'Talbot',         firstname: 'Marisa',     h: {           2022: 6,  2023: 4,  2024: 4,  2025: 4,  2026: 4  } },
  { surname: 'Thompson',       firstname: 'Phil',       h: { 2021: 6,  2022: 6,  2023: 0,  2024: -4, 2025: -4, 2026: -4 } },
  { surname: 'Vose',           firstname: 'Rhona',      h: { 2021: -2, 2022: -2, 2023: -2, 2024: -2, 2025: -2, 2026: -2 } },
  { surname: 'Wallace',        firstname: 'Brooks',     h: {                                         2026: 6  } },
  { surname: 'Warburton',      firstname: 'Rupert',     h: {                               2024: 4,  2025: 2,  2026: 2  } },
  { surname: 'Watts',          firstname: 'Annie',      h: { 2021: -4, 2022: -4, 2023: -4, 2024: -4, 2025: -4, 2026: -4 } },
  { surname: 'Weinberger',     firstname: 'Paul',       h: { 2021: 6,  2022: 6,  2023: 6,  2024: 6,  2025: 6,  2026: 6  } },
  { surname: 'Williams',       firstname: 'Chris',      h: {                                         2026: 6  } },
  { surname: 'Wren',           firstname: 'Joseph',     h: {                               2024: 4,  2025: 6,  2026: 6  } },
  { surname: 'Young',          firstname: 'Toby',       h: {                               2024: 4,  2025: 6,  2026: 6  } },
];

export function fmt(n: number | undefined): string {
  if (n === undefined) return '—';
  if (n > 0) return `+${n}`;
  return String(n);
}

export function getTrend(m: Member): { symbol: string; color: string } {
  const h25 = m.h[2025];
  const h26 = m.h[2026];
  if (h25 === undefined) return { symbol: '★', color: 'var(--gold)' };
  if (h26 !== undefined && h26 < h25) return { symbol: '▲', color: '#2d8a4e' };
  if (h26 !== undefined && h26 > h25) return { symbol: '▼', color: '#c0392b' };
  return { symbol: '—', color: 'var(--text-muted)' };
}

export const SORTED_MEMBERS = [...MEMBERS]
  .filter(m => m.h[2026] !== undefined)
  .sort((a, b) => {
    const diff = (a.h[2026] as number) - (b.h[2026] as number);
    return diff !== 0 ? diff : a.surname.localeCompare(b.surname);
  });
