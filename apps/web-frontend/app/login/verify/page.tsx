export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <header className="mb-8 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400" />
            <span className="font-semibold tracking-tight text-lg">SignaTrust</span>
          </div>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-sm p-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 mb-4">
            <svg className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2">Check Your Email</h1>
          <p className="text-zinc-400 mb-4">
            A sign-in link has been sent to your email address.
          </p>
          <p className="text-sm text-zinc-500">
            Click the link in the email to complete sign in. The link expires in 24 hours.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          <a href="/login" className="text-emerald-400 hover:text-emerald-300">
            Use a different email
          </a>
        </p>
      </div>
    </div>
  );
}
