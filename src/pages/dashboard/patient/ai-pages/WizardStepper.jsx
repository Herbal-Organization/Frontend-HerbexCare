import { WIZARD_STEPS } from "./aiConsultationConfig";

function WizardStepper({ currentStep }) {
  const currentStepIndex = WIZARD_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="mb-8">
      {/* Step indicators */}
      <div className="flex items-center justify-between relative">
        {/* Connector lines background */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-slate-200 z-0" />
        <div
          className="absolute top-6 left-0 h-1 bg-emerald-600 transition-all duration-300 z-0"
          style={{
            width: `${currentStepIndex > 0 ? (currentStepIndex / (WIZARD_STEPS.length - 1)) * 100 : 0}%`,
          }}
        />

        {/* Steps */}
        {WIZARD_STEPS.map((step, index) => (
          <div
            key={step.id}
            className="flex flex-col items-center relative z-10"
          >
            {/* Circle */}
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full font-bold transition-all shadow-md ${
                index <= currentStepIndex
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-500 border-2 border-slate-200"
              }`}
            >
              {index < currentStepIndex ? "✓" : index + 1}
            </div>

            {/* Label */}
            <span
              className={`mt-3 text-xs font-semibold text-center transition-all whitespace-nowrap ${
                index <= currentStepIndex
                  ? "text-emerald-600"
                  : "text-slate-400"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-6 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
          style={{
            width: `${((currentStepIndex + 1) / WIZARD_STEPS.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

export default WizardStepper;
