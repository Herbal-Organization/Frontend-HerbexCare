export const INITIAL_FORM = {
  weightKg: "",
  heightCm: "",
  severityScore: "",
  systolicBp: "",
  diastolicBp: "",
  temperatureCelsius: "",
  heartRateBpm: "",
  symptomDurationDays: "",
  symptomsText: "",
};

export const FORM_FIELDS = [
  { key: "weightKg", label: "الوزن (كجم)", step: "0.1", min: "0" },
  { key: "heightCm", label: "الطول (سم)", step: "0.1", min: "0" },
  {
    key: "severityScore",
    label: "درجة شدة الحالة (0-10)", // e.g. 1 => regular, 5 => medium , 10 => urgent
    step: "1",
    min: "0",
    max: "10",
  },
  {
    key: "systolicBp",
    label: "ضغط الدم الانقباضي (الرقم الكبير)",
    step: "1",
    min: "0",
  },
  {
    key: "diastolicBp",
    label: "ضغط الدم الانبساطي (الرقم الصغير)",
    step: "1",
    min: "0",
  },
  {
    key: "temperatureCelsius",
    label: "درجة حرارة الجسم",
    step: "0.1",
    min: "0",
  },
  { key: "heartRateBpm", label: "معدل ضربات القلب", step: "1", min: "0" },
  {
    key: "symptomDurationDays",
    label: "مدة المرض (أيام)",
    step: "1",
    min: "0",
  },
];
