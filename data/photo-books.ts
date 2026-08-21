export interface RichPagePhoto {
  src: string;
  caption?: string;
  captionFont?: string;
  captionSize?: string;
  captionColour?: string;
  captionPosition?: 'top' | 'bottom';
  objectPosition?: string;
}

export type RichPageLayout =
  | 'single'
  | 'title-hero'
  | 'two-photos'
  | 'grid-left'
  | 'grid-right'
  | 'grid-2x2'
  | 'sf-single'   // one photo, full-page contain
  | 'sf-pair';    // two landscape photos stacked, contain

export interface RichPage {
  layout: RichPageLayout;
  title?: string;
  subtitle?: string;
  photos: RichPagePhoto[];
  sharedCaption?: string;
}

export interface PhotoBook {
  id: string;
  title: string;
  spineColour: string;
  singlePage?: boolean;
  pages: string[];
  richPages?: RichPage[];
}

const SF = (n: number) => `/archive/years-photos/2026/silver-fox-${String(n).padStart(2, '0')}.jpg`;

export const photoBooks: PhotoBook[] = [
  // Shelf 1
  {
    id: 'book-2026',
    title: '2026 Season',
    spineColour: '#2D5A3D',
    pages: [],
    richPages: [
      // ── Silver Fox — 15 August 2026 — 26 pages, 30 photos ──────────────
      // Landscape pairs: 01+02, 16+17, 19+20, 23+24
      // Landscape alone: 04, 07, 21
      // Portrait (1 per page): all others
      { layout: 'sf-pair',   title: 'Silver Fox', subtitle: '15 August 2026',
        photos: [{ src: SF(1), caption: '' }, { src: SF(2), caption: '' }] },
      { layout: 'sf-single', photos: [{ src: SF(3),  caption: '' }] },
      { layout: 'sf-single', photos: [{ src: SF(4),  caption: '' }] },
      { layout: 'sf-single', photos: [{ src: SF(5),  caption: '' }] },
      { layout: 'sf-single', photos: [{ src: SF(6),  caption: '' }] },
      { layout: 'sf-single', photos: [{ src: SF(7),  caption: '' }] },
      { layout: 'sf-single', photos: [{ src: SF(8),  caption: '' }] },
      { layout: 'sf-single', photos: [{ src: SF(9),  caption: '' }] },
      { layout: 'sf-single', photos: [{ src: SF(10), caption: '' }] },
      { layout: 'sf-single', photos: [{ src: SF(11), caption: '' }] },
      { layout: 'sf-single', photos: [{ src: SF(12), caption: '' }] },
      { layout: 'sf-single', photos: [{ src: SF(13), caption: '' }] },
      { layout: 'sf-single', photos: [{ src: SF(14), caption: '' }] },
      { layout: 'sf-single', photos: [{ src: SF(15), caption: '' }] },
      { layout: 'sf-pair',   photos: [{ src: SF(16), caption: '' }, { src: SF(17), caption: '' }] },
      { layout: 'sf-single', photos: [{ src: SF(18), caption: '' }] },
      { layout: 'sf-pair',   photos: [{ src: SF(19), caption: '' }, { src: SF(20), caption: '' }] },
      { layout: 'sf-single', photos: [{ src: SF(21), caption: '' }] },
      { layout: 'sf-single', photos: [{ src: SF(22), caption: '' }] },
      { layout: 'sf-pair',   photos: [{ src: SF(23), caption: '' }, { src: SF(24), caption: '' }] },
      { layout: 'sf-single', photos: [{ src: SF(25), caption: '' }] },
      { layout: 'sf-single', photos: [{ src: SF(26), caption: '' }] },
      { layout: 'sf-single', photos: [{ src: SF(27), caption: '' }] },
      { layout: 'sf-single', photos: [{ src: SF(28), caption: '' }] },
      { layout: 'sf-single', photos: [{ src: SF(29), caption: '' }] },
      { layout: 'sf-single', photos: [{ src: SF(30), caption: '' }] },
      // ── General season pages (drop page-01…18.jpg into the same folder) ─
      ...Array.from({ length: 18 }, (_, i) => ({
        layout: 'single' as const,
        photos: [{ src: `/archive/years-photos/2026/page-${String(i + 1).padStart(2, '0')}.jpg` }],
      })),
    ],
  },
  {
    id: 'book-2025',
    title: '2025 Season',
    spineColour: '#C9A84C',
    pages: Array.from({ length: 50 }, (_, i) =>
      `/archive/years-photos/page-${String(i + 1).padStart(2, '0')}.jpg`
    ),
  },
  { id: 'book-2024',    title: '2024 Season',           spineColour: '#6B2737', pages: [] },
  { id: 'book-2023',    title: '2023 Season',           spineColour: '#1B3A5C', pages: [] },
  { id: 'book-2020-22', title: '2020–22 Season',        spineColour: '#2D5A3D', pages: [] },
  { id: 'book-2019',    title: '2019 Season',           spineColour: '#7B4F2E', pages: [] },
  // Shelf 2
  { id: 'book-2017-19', title: '2017–19 Season',        spineColour: '#C9A84C', pages: [] },
  { id: 'book-2014-16', title: '2014–16 Season',        spineColour: '#1B3A5C', pages: [] },
  { id: 'book-2011-13', title: '2011–13 Season',        spineColour: '#6B2737', pages: [] },
  { id: 'book-2008-10', title: '2008–10 Season',        spineColour: '#2D5A3D', pages: [] },
  { id: 'book-2003-07', title: '2003–07 Season',        spineColour: '#7B4F2E', pages: [] },
  {
    id: 'book-intl',
    title: 'Past International Days',
    spineColour: '#6B2737',
    singlePage: true,
    pages: Array.from({ length: 21 }, (_, i) =>
      `/archive/intl-days/International_Day${String(i + 1).padStart(2, '0')}.jpg`
    ),
  },
];
