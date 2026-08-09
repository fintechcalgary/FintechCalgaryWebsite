"use client";

export default function PanelSectionHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="space-y-1 min-w-0">
        <h2 className="text-lg sm:text-xl font-semibold text-white">{title}</h2>
        {description ? (
          <p className="text-gray-400 text-sm sm:text-base">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="w-full sm:w-auto">{actions}</div> : null}
    </div>
  );
}
