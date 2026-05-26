import {
  FaSpa,
  FaShoppingBag,
  FaShoppingCart,
  FaBookOpen,
  FaUser,
  FaLeaf,
  FaReceipt,
  FaBrain,
  FaComments,
  FaCog,
} from "react-icons/fa";

export const getPatientNavConfig = (t) => [
  {
    name: t("patientSidebar.dashboard"),
    href: "/patient/dashboard",
    icon: FaSpa,
  },
  {
    name: t("patientSidebar.myCart"),
    href: "/patient/dashboard/cart",
    icon: FaShoppingCart,
  },
  {
    name: t("patientSidebar.myOrders"),
    href: "/patient/dashboard/orders",
    icon: FaShoppingBag,
  },
  {
    name: t("patientSidebar.favorites"),
    href: "/patient/dashboard/favorites",
    icon: FaBookOpen,
  },
  {
    name: t("patientSidebar.aiConsultation"),
    href: "/patient/dashboard/ai-consultation",
    icon: FaBrain,
  },
  {
    name: "AI Chat",
    href: "/patient/dashboard/ai-chat",
    icon: FaComments,
  },
  {
    name: t("patientSidebar.herbLibrary"),
    href: "/patient/home/herbs",
    icon: FaLeaf,
  },
  {
    name: t("patientSidebar.recipeLibrary"),
    href: "/patient/home/recipes",
    icon: FaReceipt,
  },
  {
    name: t("patientSidebar.profile"),
    href: "/patient/dashboard/profile",
    icon: FaUser,
  },
  {
    name: t("patientSidebar.feedbackHistory"),
    href: "/patient/dashboard/feedbacks",
    icon: FaComments,
  },
  {
    name: t("patientSidebar.settings"),
    href: "/patient/dashboard/settings",
    icon: FaCog,
  },
];
