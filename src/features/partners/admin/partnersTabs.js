import { FiImage, FiUsers } from "react-icons/fi";

export const PARTNERS_TABS = [
  {
    id: "display",
    label: "Public Partners",
    description: "Add & manage public list",
    icon: FiImage,
  },
  {
    id: "applications",
    label: "Applications",
    description: "Review & approve signups",
    icon: FiUsers,
  },
];

export const DEFAULT_PARTNERS_TAB = "display";
