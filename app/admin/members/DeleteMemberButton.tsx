'use client';

export function DeleteMemberButton({
  action,
  userId,
  email,
  name,
}: {
  action: (formData: FormData) => Promise<void>;
  userId: string;
  email: string;
  name: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Remove ${name || email} from the club?\n\nThis will permanently delete their account and cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="user_id" value={userId} />
      <input type="hidden" name="email" value={email} />
      <button
        type="submit"
        style={{
          padding: '4px 11px',
          background: 'none',
          border: '1px solid rgba(180,0,0,.25)',
          color: 'rgba(160,0,0,.85)',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '.04em',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Remove
      </button>
    </form>
  );
}
