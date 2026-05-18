const HERO_IMAGE = '/images/Barnes_Bowling_Club_Sep_1_SV_2.JPG';

export function HeroCarousel() {
  return (
    <section
      className="hero-full hero-carousel"
      style={{
        backgroundImage: `url('${HERO_IMAGE}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
}
