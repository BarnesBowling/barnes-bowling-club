import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyMemberSession, SESSION_COOKIE } from '@/lib/memberSession';

export default async function MembersLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionValue) redirect('/login');

  const session = await verifyMemberSession(sessionValue);
  if (!session) redirect('/login');

  return <>{children}</>;
}
