import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getImagesByContext } from '@/lib/images';

function parsePosition(altText: string | null): { objectPosition: string; cleanAlt: string | null } {
  if (altText?.startsWith('pos:')) {
    const pipe = altText.indexOf('|');
    if (pipe !== -1) {
      const n = parseInt(altText.slice(4, pipe), 10);
      return {
        objectPosition: isNaN(n) ? 'center center' : `center ${n}%`,
        cleanAlt: altText.slice(pipe + 1) || null,
      };
    }
  }
  return { objectPosition: 'center center', cleanAlt: altText };
}

const FALLBACK_IMAGES = [
  { src: '/images/gallery1.JPG',      alt: 'Club photo 1',                                    contain: true  },
  { src: '/images/gallery2.JPG',      alt: 'Club photo 2',                                    contain: false },
  { src: '/images/gallery3.JPG',      alt: 'Club photo 3',                                    contain: false },
  { src: '/images/gallery4.JPG',      alt: 'Club photo 4',                                    contain: false },
  { src: '/images/gallery9.JPG',      alt: 'Club photo 5',                                    contain: false },
  { src: '/images/members_trio.jpg',  alt: 'Barnes Bowling Club members',                     contain: false },
  { src: '/images/gallery7.JPG',      alt: 'Club photo 7',                                    contain: true  },
  { src: '/images/gallery8.JPG',      alt: 'Club photo 8',                                    contain: true  },
  { src: '/images/trophy_winner.jpg', alt: 'Trophy presentation at Barnes Bowling Club',      contain: false, objectPosition: 'center top' },
];

export default async function Gallery() {
  const dbImages = await getImagesByContext('gallery').catch(() => []);
  const useDb = dbImages.length > 0;

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
            {useDb
              ? dbImages.map((img, i) => {
                  const { objectPosition, cleanAlt } = parsePosition(img.alt_text);
                  return (
                    <div key={img.id} style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'var(--green-deep)' }}>
                      <img
                        src={img.public_url}
                        alt={cleanAlt ?? img.caption ?? `Club photo ${i + 1}`}
                        title={img.caption ?? undefined}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', objectPosition }}
                      />
                    </div>
                  );
                })
              : FALLBACK_IMAGES.map((img) => (
                  <div key={img.src} style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'var(--green-deep)' }}>
                    <img
                      src={img.src}
                      alt={img.alt}
                      style={{ width: '100%', height: '100%', objectFit: img.contain ? 'contain' : 'cover', display: 'block', objectPosition: img.objectPosition }}
                    />
                  </div>
                ))
            }
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
