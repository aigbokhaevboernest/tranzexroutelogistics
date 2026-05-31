import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-display text-8xl font-black text-navy">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-navy">Page not found</h2>
        <p className="mt-2 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-brand-red px-6 py-3 font-bold text-white hover:opacity-90"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
