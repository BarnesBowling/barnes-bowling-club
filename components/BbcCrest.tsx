type BbcCrestProps = {
  size?: number;
  className?: string;
  light?: boolean;
};

export function BbcCrest({ size = 76, className, light = false }: BbcCrestProps) {
  const gold = light ? '#d8bd72' : '#b5924a';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 136 136"
      fill="none"
      className={className}
      role="img"
      aria-label="Barnes Bowling Club crest"
    >
      <circle cx="68" cy="68" r="63" stroke={gold} strokeWidth="1.5" />
      <circle cx="68" cy="68" r="56" stroke={gold} strokeOpacity="0.3" strokeWidth="0.75" />
      <text
        x="68"
        y="46"
        textAnchor="middle"
        fontFamily="DM Sans, Arial, sans-serif"
        fontSize="8.5"
        fontWeight="600"
        letterSpacing="5"
        fill={gold}
        fillOpacity="0.7"
      >
        EST
      </text>
      <text
        x="68"
        y="80"
        textAnchor="middle"
        fontFamily="Georgia, Playfair Display, serif"
        fontSize="30"
        fontWeight="500"
        letterSpacing="4"
        fill={gold}
      >
        BBC
      </text>
      <text
        x="68"
        y="97"
        textAnchor="middle"
        fontFamily="DM Sans, Arial, sans-serif"
        fontSize="10"
        fontWeight="300"
        letterSpacing="4"
        fill={gold}
        fillOpacity="0.78"
      >
        c·1725
      </text>
      <line x1="30" y1="44" x2="46" y2="44" stroke={gold} strokeOpacity="0.35" strokeWidth="0.75" />
      <line x1="90" y1="44" x2="106" y2="44" stroke={gold} strokeOpacity="0.35" strokeWidth="0.75" />
    </svg>
  );
}
