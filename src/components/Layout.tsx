import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-[var(--byosync-gray-200)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-lg font-bold text-[var(--byosync-blue)] transition hover:opacity-90"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--byosync-blue-pale)] text-[var(--byosync-blue)]">◇</span>
            ByoSync
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--byosync-gray-600)] transition hover:bg-[var(--byosync-gray-100)] hover:text-[var(--byosync-blue)]"
            >
              Home
            </Link>
            <Link
              to="/identity/create"
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--byosync-gray-600)] transition hover:bg-[var(--byosync-gray-100)] hover:text-[var(--byosync-blue)]"
            >
              Create Identity
            </Link>
            <Link
              to="/identity/lookup"
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--byosync-gray-600)] transition hover:bg-[var(--byosync-gray-100)] hover:text-[var(--byosync-blue)]"
            >
              Look up
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-[var(--byosync-gray-200)] bg-white py-5">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-[var(--byosync-gray-500)]">
          ByoSync — Zero-Biometrics Identity Platform
        </div>
      </footer>
    </div>
  );
}
