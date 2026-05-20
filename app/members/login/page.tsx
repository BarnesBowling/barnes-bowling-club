import { redirect } from 'next/navigation';

export default function MembersLogin({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  void searchParams;
  redirect('/login');
}
