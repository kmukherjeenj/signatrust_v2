import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { SignOutButton } from './sign-out-button';
import { SessionActions } from './components/SessionActions';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  // Fetch user's signing sessions
  const sessions = await prisma.signingSession.findMany({
    where: { userId: session.user.id },
    include: {
      document: true,
      signers: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const pendingSessions = sessions.filter(s => s.status === 'pending');
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const cancelledSessions = sessions.filter(s => s.status === 'cancelled');
  const expiredSessions = sessions.filter(s => s.status === 'expired');

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400" />
              <span className="font-semibold tracking-tight text-lg">SignaTrust</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">{session.user.email}</span>
            <SignOutButton />
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="text-3xl font-bold text-white">{sessions.length}</div>
            <div className="text-sm text-zinc-400">Total Sessions</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="text-3xl font-bold text-amber-400">{pendingSessions.length}</div>
            <div className="text-sm text-zinc-400">Pending</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="text-3xl font-bold text-emerald-400">{completedSessions.length}</div>
            <div className="text-sm text-zinc-400">Completed</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="text-3xl font-bold text-zinc-500">{cancelledSessions.length + expiredSessions.length}</div>
            <div className="text-sm text-zinc-400">Cancelled/Expired</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Your Signing Sessions</h2>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-medium text-black"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Session
          </Link>
        </div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/5 mb-4">
              <svg className="h-7 w-7 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">No signing sessions yet</h3>
            <p className="text-zinc-400 mb-4">Create your first session to get started</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 text-sm font-medium text-black"
            >
              Create Session
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((sess) => {
              const signedCount = sess.signers.filter(s => s.status === 'signed').length;
              const totalSigners = sess.signers.length;
              const progress = totalSigners > 0 ? (signedCount / totalSigners) * 100 : 0;

              return (
                <div
                  key={sess.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-white">{sess.document.name}</h3>
                      <p className="text-sm text-zinc-500">
                        Created {new Date(sess.createdAt).toLocaleDateString()}
                      </p>
                      {sess.expiresAt && sess.status === 'pending' && (
                        <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Deadline: {new Date(sess.expiresAt).toLocaleString()}
                          {new Date(sess.expiresAt) < new Date(Date.now() + 24 * 60 * 60 * 1000) && (
                            <span className="ml-1 text-amber-400 font-medium">Expiring soon!</span>
                          )}
                        </p>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        sess.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : sess.status === 'cancelled'
                          ? 'bg-red-500/20 text-red-400'
                          : sess.status === 'expired'
                          ? 'bg-zinc-500/20 text-zinc-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {sess.status === 'completed' ? 'Completed' :
                       sess.status === 'cancelled' ? 'Cancelled' :
                       sess.status === 'expired' ? 'Expired' : 'Pending'}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                      <span>{signedCount} of {totalSigners} signed</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Signers */}
                  <div className="flex flex-wrap gap-2">
                    {sess.signers.map((signer) => (
                      <span
                        key={signer.id}
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs ${
                          signer.status === 'signed'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-white/5 text-zinc-400'
                        }`}
                      >
                        {signer.status === 'signed' ? (
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {signer.phone || signer.email || 'Unknown'}
                      </span>
                    ))}
                  </div>

                  {/* Blockchain record and actions */}
                  {(sess.chainRecord || sess.status === 'completed') && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        {sess.chainRecord && (
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>Blockchain:</span>
                            <a
                              href={`https://explorer.solana.com/address/${sess.chainRecord}?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 font-mono"
                            >
                              {sess.chainRecord.substring(0, 8)}...{sess.chainRecord.substring(sess.chainRecord.length - 8)}
                            </a>
                          </div>
                        )}
                        {sess.status === 'completed' && (
                          <a
                            href={`/api/sessions/${sess.id}/certificate`}
                            download
                            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-3 py-1.5 text-xs font-medium text-black hover:opacity-90 transition-opacity"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download Certificate
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Session Actions (Cancel, Resend, Deadline, Audit Log, Sequential) */}
                  <SessionActions
                    sessionId={sess.id}
                    documentName={sess.document.name}
                    status={sess.status}
                    expiresAt={sess.expiresAt?.toISOString()}
                    sequentialSigning={sess.sequentialSigning}
                    signers={sess.signers.map((s) => ({
                      id: s.id,
                      email: s.email,
                      phone: s.phone,
                      status: s.status,
                      resendCount: s.resendCount,
                      lastResendAt: s.lastResendAt?.toISOString(),
                    }))}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
