export interface PhotoBook {
  id: string;
  title: string;
  spineColour: string;
  singlePage?: boolean;
  pages: string[];
}

export const photoBooks: PhotoBook[] = [
  // Shelf 1
  { id: 'book-2026',   title: '2026 Season',            spineColour: '#2D5A3D', pages: [] },
  {
    id: 'book-2025',
    title: '2025 Season',
    spineColour: '#C9A84C',
    pages: Array.from({ length: 50 }, (_, i) =>
      `/archive/years-photos/page-${String(i + 1).padStart(2, '0')}.jpg`
    ),
  },
  { id: 'book-2024',   title: '2024 Season',            spineColour: '#6B2737', pages: [] },
  { id: 'book-2023',   title: '2023 Season',            spineColour: '#1B3A5C', pages: [] },
  { id: 'book-2020-22',title: '2020–22 Season',         spineColour: '#2D5A3D', pages: [] },
  { id: 'book-2019',   title: '2019 Season',            spineColour: '#7B4F2E', pages: [] },
  // Shelf 2
  { id: 'book-2017-19',title: '2017–19 Season',         spineColour: '#C9A84C', pages: [] },
  { id: 'book-2014-16',title: '2014–16 Season',         spineColour: '#1B3A5C', pages: [] },
  { id: 'book-2011-13',title: '2011–13 Season',         spineColour: '#6B2737', pages: [] },
  { id: 'book-2008-10',title: '2008–10 Season',         spineColour: '#2D5A3D', pages: [] },
  { id: 'book-2003-07',title: '2003–07 Season',         spineColour: '#7B4F2E', pages: [] },
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

