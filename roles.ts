import { createClient } from '@/lib/supabase/server';
export async function getUserProfile(){const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return {user:null,profile:null};const {data:profile}=await supabase.from('profiles').select('*').eq('id',user.id).single();return {user,profile}}
export async function requireRole(roles:string[]){const {user,profile}=await getUserProfile();if(!user || !profile || !roles.includes(profile.role)) throw new Error('unauthorized');return {user,profile}}
