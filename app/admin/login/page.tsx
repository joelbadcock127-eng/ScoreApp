import { redirect } from 'next/navigation';

// Login now lives on the base-domain landing page.
export default function AdminLoginPage() {
  redirect('/');
}
