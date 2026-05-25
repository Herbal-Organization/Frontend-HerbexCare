import React from "react";
import {
  MdDashboard,
  MdLocalFlorist,
  MdMenuBook,
  MdAutoAwesome,
  MdBiotech,
  MdShoppingCart,
  MdPerson,
  MdSettings,
  MdChat,
} from "react-icons/md";

export const getHerbalistNavConfig = (t, { ordersCount } = {}) => [
  {
    name: t("herbalistSidebar.dashboard"),
    href: "/herbalist/dashboard",
    icon: MdDashboard,
  },
  {
    name: t("herbalistSidebar.manageHerbs"),
    href: "/herbalist/dashboard/herbs/managed",
    icon: MdLocalFlorist,
  },
  {
    name: t("herbalistSidebar.manageRecipes"),
    href: "/herbalist/dashboard/recipes",
    icon: MdMenuBook,
  },
  {
    name: t("herbalistSidebar.manageAIRecipes"),
    href: "/herbalist/dashboard/ai-recipes",
    icon: MdAutoAwesome,
  },
  {
    name: t("herbalistSidebar.manageAIChatRecipes"),
    href: "/herbalist/dashboard/ai-chat-recipes",
    icon: MdChat,
  },
  {
    name: t("herbalistSidebar.manageDiseases"),
    href: "/herbalist/dashboard/diseases",
    icon: MdBiotech,
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
