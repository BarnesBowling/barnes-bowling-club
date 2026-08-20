'use client';

// Keep the Club Admin navigation grouped without changing the existing page links or tab names.
const CARD_ORDER: Record<string, number> = {
  'Club Roster': 11,
  'Member Management': 12,
  'Member Accounts': 13,
  'Committee Photos': 14,
  'Home Page Images': 21,
  'Newsletters': 22,
  'Book a Match': 31,
  'Results & Leaderboard': 32,
  'Archive Season': 33,
  'Gallery': 41,
  'Photo Books': 42,
};

const GROUP_START: Record<string, { label: string; order: number }> = {
  'Club Roster': { label: 'Members', order: 10 },
  'Home Page Images': { label: 'Homepage & Communications', order: 20 },
  'Book a Match': { label: 'Matches & Results', order: 30 },
  'Gallery': { label: 'Gallery & Photo Books', order: 40 },
};

export function AdminLinkCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  const groupStart = GROUP_START[title];

  return (
    <>
      {groupStart && (
        <div
          style={{
            order: groupStart.order,
            flex: '1 0 100%',
            width: '100%',
            paddingTop: groupStart.order === 10 ? 0 : '1rem',
            paddingBottom: '.15rem',
            borderBottom: '1px solid rgba(45,90,61,.14)',
            fontFamily: "'Playfair Display', serif",
            fontSize: '18px',
            fontWeight: 500,
            color: 'var(--green-deep)',
          }}
        >
          {groupStart.label}
        </div>
      )}
      <a
        href={href}
        style={{
          order: CARD_ORDER[title] ?? 99,
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
    </>
  );
}
