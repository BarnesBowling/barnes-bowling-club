import { getHeroImages } from '@/lib/images';

export async function HeroCarousel() {
  const heroImages = await getHeroImages();
  const src = heroImages['hero-carousel'] ?? '/images/Barnes_Bowling_Club_Sep_1_SV_2.JPG';

  return (
    <section
      className="hero-full hero-carousel"
      style={{
        backgroundImage: `url('${src}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'saturate(0.75)',
      }}
    />
  );
}
