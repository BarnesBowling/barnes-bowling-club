async function getKey(): Promise<CryptoKey> {
  const secret = process.env.MEMBER_SESSION_SECRET ?? 'dev-fallback-secret-change-in-prod';
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

function b64uEncode(input: string | ArrayBuffer): string {
  const bytes = typeof input === 'string'
    ? new TextEncoder().encode(input)
    : new Uint8Array(input);
  let str = '';
  bytes.forEach(b => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function b64uDecode(str: string): string {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const bytes = Uint8Array.from(atob(padded), c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function b64uToBytes(str: string): Uint8Array {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
}

export const SESSION_COOKIE = 'members_session';
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export async function createMemberSession(email: string): Promise<string> {
  const payload = JSON.stringify({ email, exp: Date.now() + SESSION_MAX_AGE * 1000 });
  const b64 = b64uEncode(payload);
  const key = await getKey();
  const sigBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(b64));
  return `${b64}.${b64uEncode(sigBytes)}`;
}

export async function verifyMemberSession(cookieValue: string): Promise<{ email: string } | null> {
  const dot = cookieValue.lastIndexOf('.');
  if (dot < 1) return null;
  const b64 = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  try {
    const key = await getKey();
    const valid = await crypto.subtle.verify(
      'HMAC', key,
      b64uToBytes(sig).buffer as ArrayBuffer,
      new TextEncoder().encode(b64),
    );
    if (!valid) return null;
    const data = JSON.parse(b64uDecode(b64)) as { email: string; exp: number };
    if (!data.email || data.exp < Date.now()) return null;
    return { email: data.email };
  } catch {
    return null;
  }
}
