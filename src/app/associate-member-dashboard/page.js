import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AssociateDashboardClient from "./AssociateDashboardClient";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "associate") {
    redirect("/login");
  }

  return <AssociateDashboardClient />;
}
