import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCompanyAnalytics } from "@/lib/analytics/queries";
import StatCard from "@/components/admin/StatCard";
import BarList from "@/components/admin/BarList";
import TrendBars from "@/components/admin/TrendBars";

function formatDuration(ms) {
  if (ms === null || ms === undefined) return "—";
  const totalMin = Math.round(ms / 60000);
  if (totalMin < 60) return `${totalMin}m`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `${d}d ${h % 24}h`;
  }
  return `${h}h ${m}m`;
}

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  const analytics = await getCompanyAnalytics({
    companyId: session.user.companyId,
    days: 14,
  });

  const slaTone =
    analytics.slaCompliance === null
      ? "brand"
      : analytics.slaCompliance >= 90
        ? "success"
        : analytics.slaCompliance >= 70
          ? "warning"
          : "danger";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-white/50 mt-1">
          Last {analytics.days} days · your company
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard
          icon="ticket"
          label="Total tickets"
          value={analytics.totalTickets}
          tone="brand"
        />
        <StatCard
          icon="clock"
          label="Open now"
          value={analytics.openTickets}
          tone="warning"
        />
        <StatCard
          icon="check"
          label="SLA compliance"
          value={
            analytics.slaCompliance === null
              ? "—"
              : `${analytics.slaCompliance}%`
          }
          hint={`${analytics.resolvedCount} resolved`}
          tone={slaTone}
        />
        <StatCard
          icon="alert"
          label="Breached"
          value={analytics.breachedTickets}
          tone="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        <TrendBars title="New tickets per day" data={analytics.trend} />
        <BarList title="By status" items={analytics.byStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <BarList title="By department" items={analytics.byDepartment} />
        <BarList title="By priority" items={analytics.byPriority} />
      </div>

      <p className="text-xs text-white/40 mt-6">
        Average resolution time:{" "}
        <span className="text-white/70">
          {formatDuration(analytics.avgResolutionMs)}
        </span>
      </p>
    </div>
  );
}