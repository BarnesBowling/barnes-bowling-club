'use client';

export function AdminLinkCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '1.25rem 1.5rem',
        background: 'white',
        border: '1px solid rgba(45,90,61,.15)',
        textDecoration: 'none',
        minWidth: '200px',
        flex: '0 0 auto',
        transition: 'border-color .15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--green-mid)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(45,90,61,.15)')}
    >
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: 500, color: 'var(--green-deep)' }}>
        {title}
      </span>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--text-muted)' }}>
        {description}
      </span>
    </a>
  );
}
