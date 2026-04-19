import { Link } from 'react-router-dom';

export default function SidebarLogo({ to = '/dashboard', showAdminBadge = false }) {
  return (
    <div className="p-6 border-b border-white/5">
      <Link to={to} className="flex items-center gap-2">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="bebas text-2xl tracking-wider text-white">FitTrack</span>
      </Link>
      {showAdminBadge && (
        <div className="mt-2 inline-flex items-center gap-1.5 bg-red-600/20 text-red-300 text-xs font-bold px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
          Admin Panel
        </div>
      )}
    </div>
  );
}
