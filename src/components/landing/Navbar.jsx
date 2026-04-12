import { Link } from "react-router-dom";
import { motion } from "motion/react";
import logo from "../../assets/herbal_logo.svg";

const MotionDiv = motion.div;

function Navbar() {
  return (
    <MotionDiv
      className="flex w-full items-center justify-between"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
        <div className="flex items-center justify-center bg-primary rounded-lg p-1.5 text-white">
          <img src={logo} alt="Herbal Care Logo" className="h-6 w-6 brightness-0 invert" />
        </div>
        <h2 className="text-slate-900 text-xl font-bold leading-tight tracking-tight">
          Herbal Care
        </h2>
      </Link>

      <div className="flex items-center gap-3">

        <Link
          to="/auth"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-primary/40"
        >
          Get Started
        </Link>
      </div>
    </MotionDiv>
  );
}

export default Navbar;
