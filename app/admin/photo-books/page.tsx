import { redirect } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { addBook } from './[bookId]/actions';

export const dynamic = 'force-dynamic';

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: 'var(--gold)',
  display: 'block',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  padding: '.7rem',
  border: '1px solid rgba(45,90,61,.2)',
  fontFamily: 'inherit',
  fontSize: '14px',
  width: '100%',
  boxSizing: 'border-box',
};

export default async function PhotoBooksAdminPage() {
  try { await requireAdminSession(); } catch { redirect('/login?redirect=/admin/photo-books'); }

  const { data: books } = await supabaseAdmin
    .from('photo_books')
    .select('*')
    .order('sort_order');

  const { data: pageCounts } = await supabaseAdmin
    .from('photo_book_pages')
    .select('book_id');

  const countMap = new Map<string, number>();
  for (const row of pageCounts ?? []) {
    countMap.set(row.book_id, (countMap.get(row.book_id) ?? 0) + 1);
  }

  return (
    <>
      <Navbar />
      <main>
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <a href="/admin" className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none' }}>
              Admin
            </a>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Photo <em style={{ color: 'var(--gold-light)' }}>Books</em>
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: 'rgba(245,240,232,.65)', marginTop: '0.75rem' }}>
              Manage years-in-photos flipbooks — upload, reorder and caption photos.
            </p>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '3rem 2rem 5rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>

          <section>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--green-deep)', marginBottom: '1.25rem' }}>
              All Books
            </h2>
            <div style={{ background: 'white', border: '1px solid rgba(45,90,61,.12)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: 'rgba(45,90,61,.05)', borderBottom: '1px solid rgba(45,90,61,.12)' }}>
                    <th style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600 }}>Title</th>
                    <th style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600 }}>Spine</th>
                    <th style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600 }}>Pages</th>
                    <th style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {(books ?? []).map((book, i) => (
                    <tr
                      key={book.id}
                      style={{
                        borderBottom: i < (books?.length ?? 1) - 1 ? '1px solid rgba(45,90,61,.08)' : 'none',
                      }}
                    >
                      <td style={{ padding: '0.9rem 1.25rem', fontWeight: 500, color: 'var(--green-deep)' }}>
                        {book.title}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            background: book.spine_colour,
                            border: '1px solid rgba(0,0,0,.15)',
                            borderRadius: '2px',
                            flexShrink: 0,
                          }} />
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            {book.spine_colour}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)' }}>
                        {countMap.get(book.id) ?? 0}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                        <a
                          href={`/admin/photo-books/${book.id}`}
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--green-mid)',
                            textDecoration: 'none',
                            letterSpacing: '.05em',
                          }}
                        >
                          Edit
                        </a>
                      </td>
                    </tr>
                  ))}
                  {(books ?? []).length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '2rem 1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No books yet — run the migration first.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--green-deep)', marginBottom: '1.25rem' }}>
              Add New Book
            </h2>
            <form
              action={addBook}
              style={{
                background: 'white',
                border: '1px solid rgba(45,90,61,.12)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                maxWidth: '480px',
              }}
            >
              <div>
                <label style={labelStyle}>Title</label>
                <input name="title" required placeholder="e.g. 2027 Season" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Spine colour</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="color"
                    name="spineColour"
                    defaultValue="#2D5A3D"
                    style={{ width: '48px', height: '36px', padding: '2px', border: '1px solid rgba(45,90,61,.2)', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pick a colour for the book spine</span>
                </div>
              </div>
              <button className="btn" style={{ alignSelf: 'flex-start' }}>Add book</button>
            </form>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
