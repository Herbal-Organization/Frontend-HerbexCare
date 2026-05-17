import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row items-center justify-center p-6 md:p-12">
      <div className="w-full md:w-1/2 flex justify-center md:justify-end mb-8 md:mb-0">
        <img
          src="/404.png"
          alt="404 Error - Anxious Character"
          className="max-w-full h-auto max-h-[500px] object-contain"
        />
      </div>
      <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left md:pl-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          It's a 404 Error!
        </h1>
        <p className="text-lg text-slate-600 mb-2 max-w-md">
          Don't worry, no one even knows what "404" <i>means</i>.
        </p>
        <p className="text-lg text-slate-600 mb-6 max-w-md">
          But don't fret, everything is gonna be OK.
        </p>
        <p className="text-lg text-slate-600 mb-8 max-w-md">
          Just hit that back arrow that's somewhere up top?
        </p>
        <Link
          to="/"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-primary/40"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
