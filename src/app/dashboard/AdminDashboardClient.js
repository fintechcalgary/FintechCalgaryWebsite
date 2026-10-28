"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiFileText,
  FiFolder,
  FiGrid,
  FiSend,
  FiShield,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import AdminCard from "@/features/dashboard/AdminCard";
import { LoadingState } from "@/components/ui/Spinner";
import { STAFF_ROLE_LABELS } from "@/lib/constants";
import { getAdminPanelCards, isStaffRole } from "@/lib/permissions";

const ICONS = {
  "/dashboard/events": FiCalendar,
  "/dashboard/executives": FiUsers,
  "/dashboard/contracts": FiFileText,
  "/dashboard/community": FiGrid,
  "/dashboard/partners": FiBriefcase,
  "/dashboard/executive-applications": FiClipboard,
  "/dashboard/members": FiUserCheck,
  "/dashboard/documentation": FiFolder,
  "/dashboard/marketing-submissions": FiSend,
  "/dashboard/marketing-approvals": FiCheckCircle,
  "/dashboard/users": FiShield,
};

const SECTIONS = [
  {
    label: "Programs",
    hrefs: ["/dashboard/events", "/dashboard/community"],
  },
  {
    label: "People",
    hrefs: [
      "/dashboard/executives",
      "/dashboard/executive-applications",
      "/dashboard/members",
      "/dashboard/users",
    ],
  },
  {
    label: "Partnerships",
    hrefs: ["/dashboard/contracts", "/dashboard/partners"],
  },
  {
    label: "Marketing",
    hrefs: [
      "/dashboard/marketing-submissions",
      "/dashboard/marketing-approvals",
    ],
  },
  {
    label: "Records",
    hrefs: ["/dashboard/documentation"],
  },
];

function greetingForHour(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function groupCards(cards) {
  const used = new Set();
  const sections = SECTIONS.map((section) => {
    const items = section.hrefs
      .map((href) => cards.find((card) => card.href === href))
      .filter(Boolean);
    items.forEach((item) => used.add(item.href));
    return { label: section.label, items };
  }).filter((section) => section.items.length > 0);

  const leftover = cards.filter((card) => !used.has(card.href));
  if (leftover.length > 0) {
    sections.push({ label: "More", items: leftover });
  }

  return sections;
}

export default function AdminDashboardClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = session?.user?.role;
  const [widgets, setWidgets] = useState(null);
  const [widgetState, setWidgetState] = useState("loading");

  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (status === "authenticated" && !isStaffRole(role))
    ) {
      router.push("/login");
    }
  }, [status, router, role]);

  useEffect(() => {
    document.title = "Dashboard | FinTech Calgary";
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || !isStaffRole(role)) return undefined;

    let cancelled = false;

    async function loadWidgets() {
      try {
        const response = await fetch("/api/dashboard/summary");
        if (!response.ok) throw new Error("Failed to load dashboard summary");
        const data = await response.json();
        if (!cancelled) {
          setWidgets(data);
          setWidgetState("ready");
        }
      } catch {
        if (!cancelled) setWidgetState("error");
      }
    }

    loadWidgets();
    return () => {
      cancelled = true;
    };
  }, [status, role]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState size="lg" />
      </div>
    );
  }

  if (status !== "authenticated" || !isStaffRole(role)) {
    return null;
  }

  const panelCards = getAdminPanelCards(role);
  const sections = groupCards(panelCards);
  const name = session?.user?.username?.trim();

  return (
    <div className="min-h-screen">
      <main className="container mx-auto max-w-7xl animate-fadeIn px-6 py-10 sm:py-14">
        <header className="mb-12 max-w-3xl">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-primary">
            Staff workspace
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {greetingForHour(new Date().getHours())}
            {name ? <span className="text-white/75">, {name}</span> : ""}
          </h1>
          <p className="mt-3 max-w-xl text-base font-light leading-relaxed text-white/55 sm:text-lg">
            Club operations, grouped by what you are working on.
          </p>
        </header>

        {sections.length === 0 ? (
          <div className="fc-admin-panel px-6 py-14 text-center">
            <h2 className="fc-title text-lg">No tools assigned</h2>
            <p className="mx-auto mt-2 max-w-md fc-body">
              Your role does not include dashboard tools yet. Ask an admin if
              that looks wrong.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {sections.map((section) => (
              <section key={section.label}>
                <div className="mb-4 flex items-center gap-4">
                  <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-white/40">
                    {section.label}
                  </h2>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {section.items.map((card) => (
                    <AdminCard
                      key={card.href}
                      title={card.title}
                      description={card.description}
                      href={card.href}
                      icon={ICONS[card.href]}
                      widget={widgets?.[card.href]}
                      widgetState={widgetState}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
