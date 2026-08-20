'use client';

import { useEffect, useMemo, useState } from 'react';
import type { RichPage, RichPageLayout } from '@/data/photo-books';
import { createClient } from '@/lib/supabase/client';
import { FlipBook } from './FlipBook';

interface Props {
  pages: string[];
  title: string;
  spineColour: string;
}

interface DbPage {
  sort_order: number;
  layout: string;
  page_title: string | null;
  page_subtitle: string | null;
  shared_caption: string | null;
  photos: RichPage['photos'];
}

function toRichPage(page: DbPage): RichPage {
  return {
    layout: page.layout as RichPageLayout,
    title: page.page_title ?? undefined,
    subtitle: page.page_subtitle ?? undefined,
    sharedCaption: page.shared_caption ?? undefined,
    photos: Array.isArray(page.photos) ? page.photos : [],
  };
}

function fallbackRichPages(pages: string[]): RichPage[] {
  return pages.map(src => ({
    layout: 'single' as RichPageLayout,
    photos: [{ src }],
  }));
}

export function ShelfAlbumBook({ pages, title, spineColour }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [richPages, setRichPages] = useState<RichPage[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadEditablePages() {
      setLoading(true);

      const { data: book, error: bookError } = await supabase
        .from('photo_books')
        .select('id')
        .eq('title', title)
        .maybeSingle();

      if (cancelled) return;

      if (bookError || !book) {
        setRichPages(fallbackRichPages(pages));
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('photo_book_pages')
        .select('sort_order, layout, page_title, page_subtitle, shared_caption, photos')
        .eq('book_id', book.id)
        .order('sort_order');

      if (cancelled) return;

      if (error || !data) {
        setRichPages(fallbackRichPages(pages));
      } else {
        setRichPages((data as DbPage[]).map(toRichPage));
      }

      setLoading(false);
    }

    void loadEditablePages();
    return () => { cancelled = true; };
  }, [pages, supabase, title]);

  if (loading && richPages === null) {
    return (
      <div style={{
        minHeight: '60vh',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(245,240,232,0.65)',
        fontFamily: "'Libre Baskerville', serif",
        fontStyle: 'italic',
        fontSize: '14px',
      }}>
        Loading flipbook…
      </div>
    );
  }

  const editablePages = richPages ?? fallbackRichPages(pages);

  return (
    <FlipBook
      pages={[]}
      richPages={editablePages}
      singlepage={false}
      title={title}
      spineColour={spineColour}
    />
  );
}
