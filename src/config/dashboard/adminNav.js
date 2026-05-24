import {
  MdDashboard,
  MdPeople,
  MdLocalFlorist,
  MdLocalHospital,
  MdHealing,
  MdSmartToy,
  MdOpenInNew,
  MdSettings,
} from "react-icons/md";

export const getAdminNavConfig = (t) => [
  {
    name: t("adminSidebar.overview"),
    href: "/admin/dashboard/overview",
    icon: MdDashboard,
  },
  {
    name: t("adminSidebar.users"),
    href: "/admin/dashboard/users",
    icon: MdPeople,
  },
  {
    name: t("adminSidebar.patients"),
    href: "/admin/dashboard#patients",
    icon: MdHealing,
  },
  {
    name: t("adminSidebar.herbalists"),
    href: "/admin/dashboard#herbalists",
    icon: MdLocalFlorist,
  },
  {
    name: t("adminSidebar.diseases", "Diseases"),
    href: "/admin/dashboard/diseases",
    icon: MdLocalHospital,
  },
  {
    name: t("adminSidebar.aiConsultations", "AI Consultations"),
    href: "/admin/dashboard/ai-consultations",
    icon: MdSmartToy,
  },
  {
    name: t("adminSidebar.apiDocs"),
    href: "/admin/dashboard#api",
    icon: MdOpenInNew,
  },
  {
    name: t("adminSidebar.settings"),
    href: "/admin/dashboard#settings",
    icon: MdSettings,
  },
];
