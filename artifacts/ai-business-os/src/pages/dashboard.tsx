import {
  useGetDashboardSummary,
  useGetDealPipeline,
  useGetRecentActivity,
  getGetDashboardSummaryQueryKey,
  getGetDealPipelineQueryKey,
  getGetRecentActivityQueryKey,
} from "@workspace/api-client-react";
import { Users, Briefcase, DollarSign, CheckSquare, TrendingUp, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Layout from "@/components/Layout";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ComponentType<any>; color: string }) {
  return (
    <div className="bg-card border border-card-border rounded-xl p-5 shadow-xs" data-testid={`card-stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${color}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
  on_hold: "On Hold",
};

const STATUS_COLORS: Record<string, string> = {
  new: "#3b82f6",
  negotiation: "#f59e0b",
  won: "#10b981",
  lost: "#ef4444",
  on_hold: "#8b5cf6",
};

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const { data: pipeline, isLoading: pipelineLoading } = useGetDealPipeline({ query: { queryKey: getGetDealPipelineQueryKey() } });
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity({ query: { queryKey: getGetRecentActivityQueryKey() } });

  const pipelineData = (pipeline || []).map((item) => ({
    name: STATUS_LABELS[item.status] || item.status,
    count: item.count,
    value: item.value,
    status: item.status,
  }));

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Overview of your business performance</p>
        </div>

        {summaryLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-card-border rounded-xl p-5 h-24 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <StatCard label="Total Clients" value={summary?.totalClients ?? 0} icon={Users} color="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400" />
            <StatCard label="Total Deals" value={summary?.totalDeals ?? 0} icon={Briefcase} color="bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400" />
            <StatCard label="Total Revenue" value={`$${((summary?.totalRevenue ?? 0) / 1000).toFixed(0)}k`} icon={DollarSign} color="bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400" />
            <StatCard label="Won Deals" value={summary?.wonDeals ?? 0} icon={TrendingUp} color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" />
            <StatCard label="Open Tasks" value={summary?.openTasks ?? 0} icon={CheckSquare} color="bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400" />
            <StatCard label="Active Clients" value={summary?.activeClients ?? 0} icon={Activity} color="bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-card border border-card-border rounded-xl p-5 shadow-xs" data-testid="card-deal-pipeline">
            <h2 className="text-sm font-semibold mb-4">Deal Pipeline</h2>
            {pipelineLoading ? (
              <div className="h-52 animate-pulse bg-muted rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={pipelineData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val: number, name: string) => [
                      name === "value" ? `$${val.toLocaleString()}` : val,
                      name === "value" ? "Value" : "Count"
                    ]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", fontSize: "12px" }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {pipelineData.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#6b7280"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-card border border-card-border rounded-xl p-5 shadow-xs" data-testid="card-recent-activity">
            <h2 className="text-sm font-semibold mb-4">Recent Activity</h2>
            {activityLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 animate-pulse bg-muted rounded-lg" />
                ))}
              </div>
            ) : activity && activity.length > 0 ? (
              <ul className="space-y-2.5" data-testid="list-activity">
                {activity.map((item) => (
                  <li key={item.id} data-testid={`item-activity-${item.id}`} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                    <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      item.type === "client" ? "bg-blue-500" :
                      item.type === "deal" ? "bg-purple-500" : "bg-orange-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
