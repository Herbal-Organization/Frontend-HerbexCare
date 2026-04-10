import { Link } from "react-router-dom";
import { MdEnergySavingsLeaf } from "react-icons/md";

function AuthPageLayout({
  title,
  subtitle,
  children,
  sideDescription = "Harness the power of nature with AI-driven herbal wisdom for your daily wellness journey.",
}) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden lg:flex flex-col justify-center items-center w-5/12 bg-primary-light/50 relative overflow-hidden p-12">
        <img
          src="/auth_leaf_bg.png"
          className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-multiply"
          alt="Leaf Background"
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          <Link to="/">
            <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center text-primary mb-6 shadow-sm hover:scale-110 transition-transform">
              <MdEnergySavingsLeaf className="text-3xl" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
            Herbal Care
          </h1>
          <p className="text-slate-700 text-base max-w-sm leading-relaxed mb-12 font-medium">
            {sideDescription}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.05)] relative z-20 w-full lg:w-7/12 overflow-y-auto">
        <div className="mx-auto w-full max-w-md lg:w-md">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          </div>

          <div className="mt-8">{children}</div>

          <div className="mt-12 text-center text-xs text-slate-400 font-medium pb-8 lg:pb-0">
            <p>
              &copy; {new Date().getFullYear()} Karim Safan. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPageLayout;
