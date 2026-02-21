import { redirect } from 'next/navigation'

// Tree of Hope uses magic link auth only — no passwords.
// Redirect signup to signin.
export default function SignUpPage() {
  redirect('/auth/signin')
}
