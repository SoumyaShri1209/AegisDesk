import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSlaHoursForCompany } from "@/lib/tickets/sla-settings";
import SlaSettingsForm from "@/components/admin/SlaSettingsForm";

export default async function SlaSettingsPage() {
  const session = await getServerSession(authOptions);
  const hours = await getSlaHoursForCompany(session.user.companyId);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">SLA rules</h1>
        <p className="text-sm text-white/50 mt-1">
          Set how long each priority level has to be resolved. Changes apply
          to new tickets only — existing tickets keep their original deadline.
        </p>
      </div>

      <SlaSettingsForm initialHours={hours} />
    </div>
  );
}