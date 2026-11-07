export default function InsightHighlightRow({ title, description }) {
  return (
    <div className="fc-inset-card">
      <h4 className="fc-title mb-0.5 text-base">{title}</h4>
      <p className="fc-muted">{description}</p>
    </div>
  );
}
