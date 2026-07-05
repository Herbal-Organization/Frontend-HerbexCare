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
  MdNature,
  MdPsychology,
  MdPending,
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
    name: t("adminSidebar.herbs", "Herbs"),
    icon: MdLocalFlorist,
    children: [
      {
        name: t("adminSidebar.allHerbs", "All Herbs"),
        href: "/admin/dashboard/herbs",
        icon: MdLocalFlorist,
      },
      {
        name: t("adminSidebar.pendingHerbs", "Pending Approvals"),
        href: "/admin/dashboard/herbs/pending",
        icon: MdPending,
      },
    ],
  },
  {
    name: t("adminSidebar.recipes", "Recipes"),
    href: "/admin/dashboard/recipes",
    icon: MdMenuBook,
  },
  {
    name: t("adminSidebar.diseases", "Diseases"),
    icon: MdLocalHospital,
    children: [
      {
        name: t("adminSidebar.allDiseases", "All Diseases"),
        href: "/admin/dashboard/diseases",
        icon: MdLocalHospital,
      },
      {
        name: t("adminSidebar.pendingDiseases", "Pending Approvals"),
        href: "/admin/dashboard/diseases/pending",
        icon: MdPending,
      },
    ],
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
    name: t("adminSidebar.inventoryHerbs", "Inventory Herbs"),
    href: "/admin/dashboard/inventory-herbs",
    icon: MdNature,
  },
  {
    name: t("adminSidebar.inventoryAIRecipes", "Inventory AI Recipes"),
    href: "/admin/dashboard/inventory-ai-recipes",
    icon: MdSmartToy,
  },
  {
    name: t("adminSidebar.aiConsultationsList", "AI Consultations"),
    href: "/admin/dashboard/ai-consultations",
    icon: MdPsychology,
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
