import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPostLoginDestination } from "@/lib/permissions";

/**
 * Post-login landing: NextAuth redirects here after credentials succeed so the
 * session cookie is already on the request. One server-side hop to the right app.
 */
export default async function AuthContinuePage() {
  const session = await getServerSession(authOptions);
  const destination = getPostLoginDestination(session?.user?.role);

  if (!destination) {
    redirect("/login");
  }

  redirect(destination);
}
