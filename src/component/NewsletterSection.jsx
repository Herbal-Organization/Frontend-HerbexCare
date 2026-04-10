import React from "react";
import { IoIosMail } from "react-icons/io";
import { motion } from "motion/react";

const MotionDiv = motion.div;

function NewsletterSection() {



  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 pb-20">
      <MotionDiv
        className="bg-primary rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl shadow-primary/20"
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.45 }}
      >
        <div className="pointer-events-none absolute inset-x-16 -top-16 h-36 rounded-full bg-white/15 blur-3xl" />
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-6 backdrop-blur-sm">
            <IoIosMail className="text-3xl" />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Stay Rooted in Wellness
          </h2>
          
          <p className="text-primary-light text-lg mb-10 leading-relaxed">
            Subscribe for weekly AI-curated herbal recipes and holistic wellness tips delivered straight to your inbox.
          </p>
          
          <form className="w-full max-w-md flex flex-col sm:flex-row gap-3 mb-4" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 rounded-full px-6 py-4 outline-none text-slate-900 font-medium placeholder-slate-400 focus:ring-4 focus:ring-white/30 transition-shadow border-2 border-white/50"
              required
            />
            <button 
              type="submit" 
              className="rounded-full bg-slate-900 px-8 py-4 text-sm font-bold text-white shadow-xl hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              Subscribe Now
            </button>
          </form>
          
          <p className="text-primary-light text-xs opacity-80">
            We value your privacy. Unsubscribe at any time.
          </p>
        </div>
      </MotionDiv>
    </section>
  );
}

export default NewsletterSection;
