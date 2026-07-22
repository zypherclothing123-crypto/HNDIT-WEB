import Link from "next/link";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";

export default function UpdatePasswordPage() {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-bold text-heading">Set new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a new password for your account. Use the link from your email if
          you haven&apos;t already.
        </p>
        <div className="mt-8">
          <UpdatePasswordForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/auth/login" className="font-semibold text-[#534AB7]">
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
