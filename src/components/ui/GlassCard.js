import { glassCard } from "@/lib/uiClassNames";

export default function GlassCard({ as: Tag = "div", className = "", ...props }) {
  return <Tag className={`${glassCard} ${className}`.trim()} {...props} />;
}
