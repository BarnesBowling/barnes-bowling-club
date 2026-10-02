'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecordPaymentModal } from './RecordPaymentModal';
import type { PaymentRow } from './paymentActions';

interface Props {
  memberId: string;
  memberName: string;
  outstandingBalance: number;
}

export function RecordPaymentButton({ memberId, memberName, outstandingBalance }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSaved(_row: PaymentRow) {
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0 20px',
          height: '40px',
          background: 'var(--green-deep)',
          color: '#fff',
          border: 'none',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        Record Payment
      </button>
      {open && (
        <RecordPaymentModal
          memberId={memberId}
          memberName={memberName}
          outstandingBalance={outstandingBalance}
          onClose={() => setOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
