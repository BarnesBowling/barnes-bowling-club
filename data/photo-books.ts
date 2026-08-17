export interface RichPagePhoto {
  src: string;
  caption?: string;
}

export type RichPageLayout = 'single' | 'title-hero' | 'two-photos' | 'grid-left' | 'grid-right';

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

export const photoBooks: PhotoBook[] = [
  // Shelf 1
  {
    id: 'book-2026',
    title: '2026 Season',
    spineColour: '#2D5A3D',
    pages: [],
    richPages: [
      // General season pages — drop page-01.jpg … page-18.jpg into public/archive/years-photos/2026/
      ...Array.from({ length: 18 }, (_, i) => ({
        layout: 'single' as const,
        photos: [{ src: `/archive/years-photos/2026/page-${String(i + 1).padStart(2, '0')}.jpg` }],
      })),
      // ── Silver Fox — 15 August 2026 ──────────────────────────────────────
      // Page 19 (left): title + hero photo
      {
        layout: 'title-hero' as const,
        title: 'Silver Fox',
        subtitle: '15 August 2026',
        photos: [{ src: '/archive/years-photos/2026/silver-fox-01.jpg', caption: '' }],
      },
      // Page 20 (right): two photos with individual captions
      {
        layout: 'two-photos' as const,
        photos: [
          { src: '/archive/years-photos/2026/silver-fox-02.jpg', caption: '' },
          { src: '/archive/years-photos/2026/silver-fox-03.jpg', caption: '' },
        ],
      },
      // Page 21 (left): left column of 2×2 grid
      {
        layout: 'grid-left' as const,
        photos: [
          { src: '/archive/years-photos/2026/silver-fox-04.jpg' },
          { src: '/archive/years-photos/2026/silver-fox-05.jpg' },
        ],
      },
      // Page 22 (right): right column of 2×2 grid + shared caption
      {
        layout: 'grid-right' as const,
        photos: [
          { src: '/archive/years-photos/2026/silver-fox-06.jpg' },
          { src: '/archive/years-photos/2026/silver-fox-07.jpg' },
        ],
        sharedCaption: '',
      },
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
