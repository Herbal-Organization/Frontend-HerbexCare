import React from "react";
import {
  MdDashboard,
  MdLocalFlorist,
  MdMenuBook,
  MdBiotech,
  MdInventory,
  MdShoppingCart,
  MdPerson,
  MdSettings,
} from "react-icons/md";

export const getHerbalistNavConfig = (t, { ordersCount } = {}) => [
  {
    name: t("herbalistSidebar.dashboard"),
    href: "/herbalist/dashboard",
    icon: MdDashboard,
  },
  {
    name: t("herbalistSidebar.manageHerbs"),
    href: "/herbalist/dashboard/herbs",
    icon: MdLocalFlorist,
  },
  {
    name: t("herbalistSidebar.manageRecipes"),
    href: "/herbalist/dashboard/recipes",
    icon: MdMenuBook,
  },
  {
    name: t("herbalistSidebar.manageDiseases"),
    href: "/herbalist/dashboard/diseases",
    icon: MdBiotech,
  },
  {
    name: t("herbalistSidebar.inventory"),
    href: "/herbalist/dashboard/inventory",
    icon: MdInventory,
  },
  {
    name: t("herbalistSidebar.orders"),
    href: "/herbalist/dashboard/orders",
    icon: MdShoppingCart,
    badge: Number.isFinite(ordersCount) ? String(ordersCount) : null,
  },
  {
    name: t("herbalistSidebar.profile"),
    href: "/herbalist/dashboard/profile",
    icon: MdPerson,
  },
  {
    name: t("herbalistSidebar.settings"),
    href: "/herbalist/dashboard/settings",
    icon: MdSettings,
  },
];
