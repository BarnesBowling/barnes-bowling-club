'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type ActionResult = { error?: string } | null;

export async function resetPassword(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const password = String(formData.get('password') ?? '');
  const confirm  = String(formData.get('confirm_password') ?? '');

  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };
  if (password !== confirm)  return { error: 'Passwords do not match.' };

  const supabase = await createClient();
  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) return { error: updateError.message };

  await supabase.auth.signOut();
  redirect('/login?reset=1');
}
