import {
  MdDashboard,
  MdPeople,
  MdLocalFlorist,
  MdLocalHospital,
  MdHealing,
  MdSmartToy,
  MdSettings,
  MdInventory,
  MdMenuBook,
  MdShoppingCart,
  MdNotifications,
  MdStar,
  MdRateReview,
  MdLocalShipping,
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
    name: t("adminSidebar.patients", "Patients"),
    href: "/admin/dashboard/patients",
    icon: MdHealing,
  },
  {
    name: t("adminSidebar.herbalists", "Herbalists"),
    href: "/admin/dashboard/herbalists",
    icon: MdLocalFlorist,
  },
  {
    name: t("adminSidebar.herbs", "Herbs"),
    href: "/admin/dashboard/herbs",
    icon: MdLocalFlorist,
  },
  {
    name: t("adminSidebar.recipes", "Recipes"),
    href: "/admin/dashboard/recipes",
    icon: MdMenuBook,
  },
  {
    name: t("adminSidebar.diseases", "Diseases"),
    href: "/admin/dashboard/diseases",
    icon: MdLocalHospital,
  },
  {
    name: t("adminSidebar.orders", "Orders"),
    href: "/admin/dashboard/orders",
    icon: MdShoppingCart,
  },
  {
    name: t("adminSidebar.subOrders", "Sub-Orders"),
    href: "/admin/dashboard/sub-orders",
    icon: MdLocalShipping,
  },
  {
    name: t("adminSidebar.aiConsultations", "AI Chat"),
    href: "/admin/dashboard/ai-chat",
    icon: MdSmartToy,
  },
  {
    name: t("adminSidebar.inventory", "Inventory"),
    href: "/admin/dashboard/inventory",
    icon: MdInventory,
  },
  {
    name: t("adminSidebar.feedbacks", "Feedbacks"),
    href: "/admin/dashboard/feedbacks",
    icon: MdStar,
  },
  {
    name: t("adminSidebar.reviews", "Reviews"),
    href: "/admin/dashboard/reviews",
    icon: MdRateReview,
  },
  {
    name: t("adminSidebar.notifications", "Notifications"),
    href: "/admin/dashboard/notifications",
    icon: MdNotifications,
  },
  {
    name: t("adminSidebar.settings"),
    href: "/admin/dashboard/settings",
    icon: MdSettings,
  },
];
