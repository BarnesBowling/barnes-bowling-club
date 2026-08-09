'use client';

import { useState, useEffect, useTransition } from 'react';

type TickerMessage = {
  id: string;
  message: string;
  sort_order: number;
  active: boolean;
};

type Props = {
  initialMessages: TickerMessage[];
  addMessage: (fd: FormData) => Promise<void>;
  saveMessage: (fd: FormData) => Promise<void>;
  deleteMessage: (fd: FormData) => Promise<void>;
  toggleMessage: (fd: FormData) => Promise<void>;
  moveMessage: (fd: FormData) => Promise<void>;
};

const inputStyle = {
  padding: '.7rem',
  border: '1px solid rgba(45,90,61,.2)',
  fontFamily: 'inherit',
  fontSize: '14px',
  width: '100%',
  boxSizing: 'border-box' as const,
};
const labelStyle = {
  fontSize: '10px',
  fontWeight: 600 as const,
  letterSpacing: '.12em',
  textTransform: 'uppercase' as const,
  color: 'var(--gold)',
  display: 'block' as const,
  marginBottom: '6px',
};

export function TickerAdmin({ initialMessages, addMessage, saveMessage, deleteMessage, toggleMessage, moveMessage }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [, startTransition] = useTransition();

  useEffect(() => { setMessages(initialMessages); }, [initialMessages]);

  function submit(action: (fd: FormData) => Promise<void>, fd: FormData) {
    startTransition(async () => { await action(fd); });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ── Add form ── */}
      <form
        style={{ background: 'white', padding: '1.5rem', border: '1px solid rgba(45,90,61,.12)', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setNewText('');
          submit(addMessage, fd);
        }}
      >
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>New message</label>
          <input
            name="message"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            required
            style={inputStyle}
            placeholder="e.g. Wednesday nights 6–8pm open to all"
          />
        </div>
        <button className="btn" type="submit" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
          Add message
        </button>
      </form>

      {/* ── Messages list ── */}
      {messages.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '14px' }}>No ticker messages yet.</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            style={{
              background: 'white',
              border: '1px solid rgba(45,90,61,.1)',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              opacity: msg.active ? 1 : 0.5,
              transition: 'opacity .15s',
            }}
          >
            {/* Up / down */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexShrink: 0 }}>
              {(['up', 'down'] as const).map((dir) => {
                const disabled = dir === 'up' ? idx === 0 : idx === messages.length - 1;
                const neighbour = dir === 'up' ? messages[idx - 1] : messages[idx + 1];
                return (
                  <button
                    key={dir}
                    disabled={disabled}
                    onClick={() => {
                      if (!neighbour) return;
                      const fd = new FormData();
                      fd.set('id', msg.id);
                      fd.set('neighbour_id', neighbour.id);
                      fd.set('my_order', String(msg.sort_order));
                      fd.set('neighbour_order', String(neighbour.sort_order));
                      submit(moveMessage, fd);
                    }}
                    style={{
                      border: '1px solid rgba(45,90,61,.2)',
                      background: 'none',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      padding: '2px 8px',
                      opacity: disabled ? 0.25 : 1,
                      lineHeight: 1.4,
                    }}
                  >
                    {dir === 'up' ? '↑' : '↓'}
                  </button>
                );
              })}
            </div>

            {/* Message text / inline edit */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {editingId === msg.id ? (
                <form
                  style={{ display: 'flex', gap: '.5rem' }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    setEditingId(null);
                    submit(saveMessage, fd);
                  }}
                >
                  <input type="hidden" name="id" value={msg.id} />
                  <input
                    name="message"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                    autoFocus
                  />
                  <button className="btn" type="submit" style={{ flexShrink: 0, padding: '.5rem 1rem' }}>
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    style={{ background: 'none', border: '1px solid rgba(45,90,61,.2)', padding: '.5rem 1rem', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <span
                  onClick={() => { setEditingId(msg.id); setEditText(msg.message); }}
                  title="Click to edit"
                  style={{
                    cursor: 'text',
                    color: 'var(--green-deep)',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '14px',
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {msg.message}
                </span>
              )}
            </div>

            {/* Active toggle */}
            <button
              onClick={() => {
                const fd = new FormData();
                fd.set('id', msg.id);
                fd.set('active', String(!msg.active));
                submit(toggleMessage, fd);
              }}
              style={{
                border: '1px solid rgba(45,90,61,.25)',
                background: msg.active ? 'rgba(45,90,61,.1)' : 'none',
                padding: '4px 10px',
                cursor: 'pointer',
                fontSize: '11px',
                letterSpacing: '.05em',
                flexShrink: 0,
                color: msg.active ? 'var(--green-deep)' : 'var(--text-muted)',
                fontWeight: msg.active ? 600 : 400,
              }}
            >
              {msg.active ? 'Active' : 'Inactive'}
            </button>

            {/* Delete */}
            <button
              onClick={() => {
                if (!confirm('Delete this ticker message?')) return;
                const fd = new FormData();
                fd.set('id', msg.id);
                submit(deleteMessage, fd);
              }}
              style={{
                background: 'none',
                border: '1px solid rgba(180,0,0,.2)',
                color: '#a00',
                fontSize: '11px',
                padding: '4px 10px',
                cursor: 'pointer',
                letterSpacing: '.05em',
                flexShrink: 0,
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
