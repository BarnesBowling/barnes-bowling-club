import { getImagesByContext } from '@/lib/images';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const revalidate = 60; // ISR: refresh every 60s

export default async function GalleryPage() {
  const images = await getImagesByContext('gallery');

  return (
    <>
      <Navbar />
      <main>
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <div className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)' }}>Club Life</div>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Gallery
            </h1>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '3rem 2rem 5rem' }}>
          {images.length === 0 ? (
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'var(--text-muted)' }}>
              No photos yet — check back soon.
            </p>
          ) : (
            <div style={{ columns: '3 280px', gap: '1rem' }}>
              {images.map(img => (
                <div key={img.id} style={{ breakInside: 'avoid', marginBottom: '1rem' }}>
                  <img
                    src={img.public_url}
                    alt={img.alt_text ?? img.caption ?? 'Barnes Bowling Club'}
                    style={{ width: '100%', display: 'block' }}
                  />
                  {img.caption && (
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--text-muted)', margin: '0.4rem 0 0' }}>
                      {img.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}