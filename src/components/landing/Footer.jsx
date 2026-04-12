import React from "react";
import { MdPhotoCamera } from "react-icons/md";
import { FaLeaf, FaShareAltSquare } from "react-icons/fa";
import { GrLanguage } from "react-icons/gr";
import { motion } from "motion/react";

const MotionDiv = motion.div;

function Footer() {
  return (
    <footer className="bg-gradient-to-b from-white to-slate-50 border-t border-slate-200 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <MotionDiv
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          {/* Logo + Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center bg-primary rounded-xl p-2 text-white shadow-md">
                <FaLeaf className="text-xl" />
              </div>
              <h2 className="text-slate-900 text-2xl font-bold tracking-tight">
                Herbal Care
              </h2>
            </div>

            <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-md">
              Combining centuries-old botanical wisdom with cutting-edge
              artificial intelligence to empower your natural wellness journey.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4">
              <a
                href="#"
                className="group w-11 h-11 rounded-full bg-primary-light/40 flex items-center justify-center text-primary hover:bg-primary transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <FaShareAltSquare className="text-lg group-hover:text-white transition-colors" />
              </a>

              <a
                href="#"
                className="group w-11 h-11 rounded-full bg-primary-light/40 flex items-center justify-center text-primary hover:bg-primary transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <MdPhotoCamera className="text-lg group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>
        </MotionDiv>

        {/* Bottom Bar */}
        <MotionDiv
          className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-200"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.4, delay: 0.06, ease: "easeOut" }}
        >
          <p className="text-slate-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()}
            <span className="font-medium text-slate-600"> Karim Safan</span>.
            All rights reserved.
          </p>

          <div className="flex items-center gap-2 text-slate-400 text-sm cursor-pointer hover:text-primary transition-colors">
            <GrLanguage className="text-lg" />
            <span className="hover:underline">English (US)</span>
          </div>
        </MotionDiv>
      </div>
    </footer>
  );
}

export default Footer;
