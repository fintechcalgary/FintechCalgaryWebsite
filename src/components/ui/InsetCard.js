import { insetCard } from "@/lib/uiClassNames";

export default function InsetCard({ className = "", ...props }) {
  return <div className={`${insetCard} ${className}`.trim()} {...props} />;
}
