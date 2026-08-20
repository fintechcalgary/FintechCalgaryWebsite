import { AiLoader } from "@/components/ui/ai-loader";

/**
 * Animated AI loader used for inline and section loading states.
 */
export default function Spinner({ size = "md", className = "", text = "Loading" }) {
  return <AiLoader size={size} text={text} className={className} />;
}

/**
 * Full-area centered loading state.
 */
export function LoadingState({
  size = "lg",
  className = "",
  message,
  text = "Loading",
  fullScreen = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${
        fullScreen ? "min-h-screen" : "py-16"
      } ${className}`.trim()}
    >
      <AiLoader size={size} text={text} />
      {message ? <p className="fc-muted">{message}</p> : null}
    </div>
  );
}
