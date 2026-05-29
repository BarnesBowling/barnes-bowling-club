import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const GALLERY_IMAGES = [
  '/images/gallery1.JPG',
  '/images/gallery2.JPG',
  '/images/gallery3.JPG',
  '/images/gallery4.JPG',
  '/images/gallery9.JPG',
  '/images/bowlers_macmillan.jpg',
  '/images/gallery7.JPG',
  '/images/gallery8.JPG',
  '/images/trophy_winner.jpg',
];

export default function Gallery() {
  return (
    <>
      <Navbar />
      <main>
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <div className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)' }}>Photography</div>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
              Club <em style={{ color: 'var(--gold-light)' }}>gallery</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.7)' }}>
              A Year in Pictures
            </p>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '4rem 2rem' }}>
          <div className="gallery-grid">
            {GALLERY_IMAGES.map((src, i) => {
              const contain = src === '/images/gallery1.JPG' || src === '/images/gallery6.JPG' || src === '/images/gallery7.JPG' || src === '/images/gallery8.JPG';
              return (
                <div key={src} style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'var(--green-deep)' }}>
                  <img
                    src={src}
                    alt={src === '/images/trophy_winner.jpg' ? 'Trophy presentation at Barnes Bowling Club' : src === '/images/bowlers_macmillan.jpg' ? 'Members bowling on the green' : `Club photo ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: contain ? 'contain' : 'cover', display: 'block', objectPosition: src === '/images/trophy_winner.jpg' ? 'center top' : undefined }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
