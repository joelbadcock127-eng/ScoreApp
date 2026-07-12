import { redirect } from 'next/navigation';

// Login now lives at /login.
export default function AdminLoginPage() {
  redirect('/login');
}
