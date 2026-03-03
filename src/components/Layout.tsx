import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-[var(--byosync-gray-200)] bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-xl py-1.5 pr-2 text-lg font-bold text-[var(--byosync-blue)] transition hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--byosync-blue-pale)] text-[var(--byosync-blue)] transition group-hover:bg-[var(--byosync-blue)] group-hover:text-white">
              ◇
            </span>
            ByoSync
          </Link>
          <nav className="flex items-center gap-0.5">
            <Link
              to="/"
              className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-[var(--byosync-gray-600)] transition hover:bg-[var(--byosync-gray-100)] hover:text-[var(--byosync-blue)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Home
            </Link>
            <Link
              to="/identity/create"
              className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-[var(--byosync-gray-600)] transition hover:bg-[var(--byosync-gray-100)] hover:text-[var(--byosync-blue)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Create Identity
            </Link>
            <Link
              to="/identity/lookup"
              className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-[var(--byosync-gray-600)] transition hover:bg-[var(--byosync-gray-100)] hover:text-[var(--byosync-blue)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Look up
            </Link>
            <Link
              to="/auth/challenge"
              className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-[var(--byosync-gray-600)] transition hover:bg-[var(--byosync-gray-100)] hover:text-[var(--byosync-blue)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Challenge
            </Link>
            <Link
              to="/auth/jwks"
              className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-[var(--byosync-gray-600)] transition hover:bg-[var(--byosync-gray-100)] hover:text-[var(--byosync-blue)] hover:scale-[1.02] active:scale-[0.98]"
            >
              JWKS
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl page-in">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-[var(--byosync-gray-200)] bg-white/80 py-5 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-[var(--byosync-gray-500)]">
          ByoSync — Zero-Biometrics Identity Platform
        </div>
      </footer>
    </div>
  );
}
