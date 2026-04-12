import { Link } from "react-router-dom";
import { motion } from "motion/react";
import heroImg from "../../assets/hero_herbal_wellness.png";

const MotionDiv = motion.div;
const MotionH1 = motion.h1;
const MotionP = motion.p;

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
};

function HeroSection() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 overflow-hidden">
      <div className="pointer-events-none absolute -left-16 top-16 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <MotionDiv
          className="flex flex-col items-start gap-6"
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, amount: 0.25 }}
        >
          <MotionDiv
            variants={fadeInUp}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center rounded-full bg-primary-light px-3 py-1 text-xs font-bold tracking-widest text-primary uppercase"
          >
            Intelligent Natural Healing
          </MotionDiv>
          <MotionH1
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]"
          >
            AI-Powered Herbal Wellness for Your Daily Life
          </MotionH1>
          <MotionP
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-slate-600 max-w-lg leading-relaxed"
          >
            Discover personalized herbal recipes and natural remedies tailored to your health goals using our advanced botanical AI technology.
          </MotionP>
          <MotionDiv
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <Link
              to="/auth"
              className="rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-primary/30 transition-transform hover:scale-105"
            >
              Start Your Journey
            </Link>
            <a
              href="#how-it-works"
              className="rounded-full bg-white border border-slate-200 px-7 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              How It Works
            </a>
          </MotionDiv>
          <MotionDiv
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-3 gap-4 pt-2"
          >
            {[
              { label: "Guided Plans", value: "1K+" },
              { label: "Active Users", value: "8K+" },
              { label: "AI Matches", value: "95%" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur">
                <p className="text-lg font-extrabold text-slate-900">{item.value}</p>
                <p className="text-xs font-semibold text-slate-500">{item.label}</p>
              </div>
            ))}
          </MotionDiv>
        </MotionDiv>

        <MotionDiv
          className="relative w-full h-full min-h-[400px]"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
        >
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-primary-light to-white overflow-hidden shadow-2xl">
            <img
              src={heroImg}
              alt="Herbs and spices in wooden bowls"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <MotionDiv
            className="absolute -left-5 top-8 rounded-2xl bg-white/90 px-4 py-3 shadow-xl backdrop-blur"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <p className="text-xs font-semibold text-slate-500">Personalized Results</p>
            <p className="text-sm font-bold text-slate-900">Based on your goals</p>
          </MotionDiv>
          <MotionDiv
            className="absolute -right-5 bottom-8 rounded-2xl bg-white/90 px-4 py-3 shadow-xl backdrop-blur"
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 3.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <p className="text-xs font-semibold text-slate-500">Safety First</p>
            <p className="text-sm font-bold text-slate-900">Evidence-backed herbs</p>
          </MotionDiv>
        </MotionDiv>
      </div>
    </section>
  );
}

export default HeroSection;
