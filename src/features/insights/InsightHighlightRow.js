import InsetCard from "@/components/ui/InsetCard";

export default function InsightHighlightRow({ title, description }) {
  return (
    <InsetCard>
      <h4 className="mb-0.5 text-base">{title}</h4>
      <p className="text-muted">{description}</p>
    </InsetCard>
  );
}
