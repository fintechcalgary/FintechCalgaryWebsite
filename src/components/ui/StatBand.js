import { statBand } from "@/lib/uiClassNames";

export default function StatBand({ className = "", children, ...props }) {
  return (
    <div className={`${statBand} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
