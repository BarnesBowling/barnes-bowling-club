// Shared utilities used by all three statement renderers:
// page.tsx (web), StatementPDFButton.tsx (download), generateStatementPDF.ts (email).
// Edit here — don't copy into individual files.

function fmtDateShort(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export type GuestFeeEntry = {
  category: string;
  guest_names?: string | null;
  num_guests?: number | null;
  metadata?: Record<string, unknown> | null;
};

/**
 * Returns the inline guest detail for a guest_fee row, e.g.
 * "C Breese/A Barratt (played 19 Sep 2026)", or "" if no data.
 * guest_names column takes precedence; falls back to metadata.guest_names.
 */
export function guestFeeDetail(e: GuestFeeEntry): string {
  if (e.category !== 'guest_fee') return '';

  const names =
    (e.guest_names ?? (e.metadata?.guest_names as string | undefined)) || null;
  const numGuests = e.num_guests ?? (e.metadata?.num_guests as number | undefined) ?? null;
  const dateOfPlay = e.metadata?.date_of_play as string | undefined;

  const namesPart =
    names ?? (numGuests != null ? `${numGuests} guest${numGuests !== 1 ? 's' : ''}` : null);

  if (namesPart && dateOfPlay) return `${namesPart} (played ${fmtDateShort(dateOfPlay)})`;
  if (namesPart)               return namesPart;
  if (dateOfPlay)              return `played ${fmtDateShort(dateOfPlay)}`;
  return '';
}
