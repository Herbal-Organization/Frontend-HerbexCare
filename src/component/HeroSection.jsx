import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left side text content */}
        <div className="flex flex-col items-start gap-6">
          <div className="inline-flex items-center rounded-full bg-primary-light px-3 py-1 text-xs font-bold tracking-widest text-primary uppercase">
            Intelligent Natural Healing
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            AI-Powered Herbal Wellness for Your Daily Life
          </h1>
          <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
            Discover personalized herbal recipes and natural remedies tailored to your health goals using our advanced botanical AI technology.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/auth" className="rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-primary/30 transition-transform hover:scale-105">
              Start Your Journey
            </Link>
            <button className="rounded-full bg-white border border-slate-200 px-7 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
              How It Works
            </button>
          </div>
        </div>

        {/* Right side image */}
        <div className="relative w-full h-full min-h-[400px]">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-primary-light to-white overflow-hidden shadow-2xl">
            <img 
              src="/hero_herbal_wellness_1772812658981.png" 
              alt="Herbs and spices in wooden bowls" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
