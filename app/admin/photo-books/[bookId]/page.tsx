import { notFound, redirect } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { BookEditor } from './BookEditor';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ bookId: string }>;
}

export default async function BookEditorPage({ params }: PageProps) {
  try { await requireAdminSession(); } catch { redirect('/login?redirect=/admin/photo-books'); }

  const { bookId } = await params;

  // The 2025 book is deliberately preserved exactly as it is.
  if (bookId === 'book-2025') redirect('/admin/photo-books');

  const [{ data: book }, { data: pages }] = await Promise.all([
    supabaseAdmin.from('photo_books').select('*').eq('id', bookId).maybeSingle(),
    supabaseAdmin.from('photo_book_pages').select('*').eq('book_id', bookId).order('sort_order'),
  ]);

  if (!book) notFound();

  return (
    <>
      <Navbar />
      <main>
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <a href="/admin/photo-books" className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none' }}>
              Photo Books
            </a>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              {book.title}
            </h1>
          </div>
        </div>
        <div className="section-inner" style={{ padding: '3rem 2rem 5rem' }}>
          {/* Original integrated editor: thumbnails, captions, positioning and styling controls. */}
          <BookEditor book={book} pages={pages ?? []} />
        </div>
      </main>
      <Footer />
    </>
  );
}
