import type { IconName } from "./icons";

// Single source of truth for the "secondary" destinations, shared by the mobile
// bottom-sheet (MobileTabBar) and the desktop "Plus" dropdown (DesktopMoreMenu).
// `description` is shown on desktop only; the mobile sheet uses label + icon.

export type NavItem = {
  label: string;
  href: string;
  icon: IconName;
  description: string;
};

export const SHEET_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Organiser",
    items: [
      {
        label: "Menu de la semaine",
        href: "/menu-semaine",
        icon: "calendar",
        description: "Planifiez vos repas",
      },
      {
        label: "Liste de courses",
        href: "/liste-courses",
        icon: "cart",
        description: "Vos ingrédients à acheter",
      },
    ],
  },
  {
    title: "Mon espace",
    items: [
      {
        label: "Favoris",
        href: "/favoris",
        icon: "heart",
        description: "Vos recettes sauvegardées",
      },
      {
        label: "Paramètres",
        href: "/parametres",
        icon: "sliders",
        description: "Ingrédients, ustensiles, unités…",
      },
    ],
  },
];

/** Flat list of the secondary routes (for active-state detection). */
export const SHEET_ROUTES = SHEET_GROUPS.flatMap((g) => g.items.map((i) => i.href));
