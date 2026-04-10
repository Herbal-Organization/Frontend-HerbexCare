import {IoChatbubbleEllipses, IoReceiptSharp} from "react-icons/io5";
import {FaBrain} from "react-icons/fa";
import { motion } from "motion/react";

const MotionDiv = motion.div;

function StepsSection() {
  const steps = [
    {
      icon: <IoChatbubbleEllipses className="text-3xl"/>,
      title: "Share Your Needs",
      description: "Tell us about your wellness goals, symptoms, or dietary preferences through our intuitive chat interface."
    },
    {
      icon: <FaBrain className="text-3xl" />,
      title: "AI Analysis",
      description: "Our advanced algorithms cross-reference clinical herbal databases and safety protocols in seconds."
    },
    {
      icon: <IoReceiptSharp className="text-3xl" />,
      title: "Get Recipes",
      description: "Receive custom-tailored herbal tea blends, tinctures, and wellness plans specific to your body's needs."
    }
  ];

  return (
    <section id="how-it-works" className="bg-slate-100 py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <MotionDiv
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45 }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Simple Steps to Natural Care
          </h2>
          <p className="text-slate-600 text-lg">
            Our AI analyzes your unique wellness profile to provide safe, effective, and evidence-based herbal solutions.
          </p>
        </MotionDiv>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <MotionDiv
              key={idx}
              className="bg-white rounded-3xl p-8 shadow-sm flex flex-col items-center text-center transition-transform hover:-translate-y-1"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: idx * 0.12 }}
            >
              <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center text-primary mb-6">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{step.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                {step.description}
              </p>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StepsSection;
