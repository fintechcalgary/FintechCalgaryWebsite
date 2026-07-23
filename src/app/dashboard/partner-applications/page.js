import { redirect } from "next/navigation";

export default function PartnerApplicationsRedirect() {
  redirect("/dashboard/partners?tab=applications");
}
