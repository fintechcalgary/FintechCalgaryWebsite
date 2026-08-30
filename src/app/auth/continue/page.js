import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isStaffRole } from "@/lib/permissions";

/**
 * Post-login landing: NextAuth redirects here after credentials succeed so the
 * session cookie is already on the request. One server-side hop to the right app.
 */
export default async function AuthContinuePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role) {
    redirect("/login");
  }

  if (session.user.role === "associate") {
    redirect("/partner-dashboard");
  }

  if (isStaffRole(session.user.role)) {
    redirect("/dashboard");
  }

  redirect("/login");
}
