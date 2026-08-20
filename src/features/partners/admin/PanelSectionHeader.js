"use client";

export default function PanelSectionHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="space-y-1 min-w-0">
        <h2 className="fc-title-accent text-lg sm:text-xl">{title}</h2>
        {description ? (
          <p className="fc-body">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="w-full sm:w-auto">{actions}</div> : null}
    </div>
  );
}
