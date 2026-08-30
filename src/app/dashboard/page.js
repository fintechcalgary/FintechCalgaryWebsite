import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { isStaffRole } from "@/lib/permissions";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!isStaffRole(session.user.role)) {
    if (session.user.role === "associate") {
      redirect("/partner-dashboard");
    }
    redirect("/login");
  }

  return <AdminDashboardClient />;
}
