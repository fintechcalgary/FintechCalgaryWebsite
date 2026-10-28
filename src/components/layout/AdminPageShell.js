import {
  AdminPageLede,
  AdminPageTitle,
} from "@/components/ui/SectionHeading";

/**
 * Standard admin page column. Matches the dashboard max width and padding.
 */
export function AdminPageShell({ children }) {
  return (
    <div className="relative min-h-screen">
      <main className="container relative mx-auto max-w-7xl animate-fadeIn px-6 py-8">
        {children}
      </main>
    </div>
  );
}

export function AdminPageHeader({ title, lede, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-2">
        <AdminPageTitle>{title}</AdminPageTitle>
        {lede ? <AdminPageLede>{lede}</AdminPageLede> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

export function AdminAccessMessage({ children }) {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-8 text-center">
        <p className="fc-muted">{children}</p>
      </div>
    </div>
  );
}
