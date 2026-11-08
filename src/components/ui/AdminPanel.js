import { adminPanel } from "@/lib/uiClassNames";

export default function AdminPanel({ as: Tag = "div", className = "", ...props }) {
  return <Tag className={`${adminPanel} ${className}`.trim()} {...props} />;
}
