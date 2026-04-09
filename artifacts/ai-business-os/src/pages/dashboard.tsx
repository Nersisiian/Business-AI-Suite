import {
  useGetDashboardSummary,
  useGetDealPipeline,
  useGetRecentActivity,
  getGetDashboardSummaryQueryKey,
  getGetDealPipelineQueryKey,
  getGetRecentActivityQueryKey,
} from "@workspace/api-client-react";
import {
  Users, Briefcase, DollarSign, CheckSquare,
  TrendingUp, TrendingDown, Activity,
  ArrowUpRight, UserPlus, Star
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, AreaChart, Area, CartesianGrid
} from "recharts";
import Layout from "@/components/Layout";

function StatCard({
  label, value, icon: Icon, iconClass, trend, trendLabel, sub
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<any>;
  iconClass: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  sub?: string;
}) {
  return (
    <div className="bg-card border border-card-border rounded-2xl p-5 shadow-xs hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${iconClass}`}>
          <Icon size={18} />
        </div>
        {trendLabel && (
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trend === "up" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" :
            trend === "down" ? "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400" :
            "bg-muted text-muted-foreground"
          }`}>
            {trend === "up" ? <TrendingUp size={11} /> : trend === "down" ? <TrendingDown size={11} /> : null}
            {trendLabel}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight mb-0.5">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {sub && <p className="text-xs text-muted-foreground/60 mt-1">{sub}</p>}
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
  new: "#6366f1",
  negotiation: "#f59e0b",
  won: "#10b981",
  lost: "#ef4444",
  on_hold: "#8b5cf6",
};

const PIE_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

const ACTIVITY_ICONS: Record<string, React.ComponentType<any>> = {
  client: UserPlus,
  deal: Star,
  task: CheckSquare,
};
const ACTIVITY_COLORS: Record<string, string> = {
  client: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
  deal: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
  task: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
};

function formatTimeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-card-border rounded-xl shadow-md px-3.5 py-2.5 text-sm">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-muted-foreground">
            {p.name}: <span className="font-semibold text-foreground">
              {p.name === "Value" ? `$${Number(p.value).toLocaleString()}` : p.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-card-border rounded-xl shadow-md px-3.5 py-2.5 text-sm">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-muted-foreground">Count: <span className="font-semibold text-foreground">{payload[0].value}</span></p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const { data: pipeline, isLoading: pipelineLoading } = useGetDealPipeline({ query: { queryKey: getGetDealPipelineQueryKey() } });
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity({ query: { queryKey: getGetRecentActivityQueryKey() } });

  const pipelineData = (pipeline || []).map((item) => ({
    name: STATUS_LABELS[item.status] || item.status,
    Count: item.count,
    Value: item.value,
    status: item.status,
  }));

  const pieData = pipelineData.filter(d => d.Count > 0).map(d => ({
    name: d.name,
    value: d.Count,
    status: d.status,
  }));

  const winRate = summary ? Math.round(((summary.wonDeals ?? 0) / Math.max(summary.totalDeals ?? 1, 1)) * 100) : 0;

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Good morning 👋</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Here's what's happening with your business today.</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* Stat cards */}
        {summaryLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card border border-card-border rounded-2xl p-5 h-32 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Clients"
              value={summary?.totalClients ?? 0}
              icon={Users}
              iconClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
              trend="up"
              trendLabel="+12%"
              sub={`${summary?.activeClients ?? 0} active`}
            />
            <StatCard
              label="Total Deals"
              value={summary?.totalDeals ?? 0}
              icon={Briefcase}
              iconClass="bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400"
              trend="up"
              trendLabel="+5%"
              sub={`${summary?.wonDeals ?? 0} won`}
            />
            <StatCard
              label="Total Revenue"
              value={`$${((summary?.totalRevenue ?? 0) / 1000).toFixed(1)}k`}
              icon={DollarSign}
              iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
              trend="up"
              trendLabel="+18%"
              sub="from won deals"
            />
            <StatCard
              label="Open Tasks"
              value={summary?.openTasks ?? 0}
              icon={CheckSquare}
              iconClass="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
              trend="neutral"
              trendLabel="pending"
              sub="needs attention"
            />
          </div>
        )}

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Bar chart - deal pipeline */}
          <div className="lg:col-span-2 bg-card border border-card-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="text-sm font-semibold">Deal Pipeline</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Deals by stage</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 font-medium px-2 py-1 rounded-full">
                <TrendingUp size={11} />
                {winRate}% win rate
              </div>
            </div>
            {pipelineLoading ? (
              <div className="h-56 animate-pulse bg-muted rounded-xl mt-4" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={pipelineData} margin={{ top: 8, right: 0, bottom: 0, left: 0 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={25} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", radius: 6 }} />
                  <Bar dataKey="Count" radius={[6, 6, 0, 0]}>
                    {pipelineData.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#6b7280"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Donut chart - deal distribution */}
          <div className="bg-card border border-card-border rounded-2xl p-5 shadow-xs">
            <div className="mb-1">
              <h2 className="text-sm font-semibold">Deal Distribution</h2>
              <p className="text-xs text-muted-foreground mt-0.5">By status</p>
            </div>
            {pipelineLoading ? (
              <div className="h-56 animate-pulse bg-muted rounded-xl mt-4" />
            ) : pieData.length === 0 ? (
              <div className="flex items-center justify-center h-52 text-sm text-muted-foreground">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="46%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Revenue by stage */}
          <div className="bg-card border border-card-border rounded-2xl p-5 shadow-xs">
            <div className="mb-1">
              <h2 className="text-sm font-semibold">Deal Value by Stage</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Total value per pipeline stage</p>
            </div>
            {pipelineLoading ? (
              <div className="h-48 animate-pulse bg-muted rounded-xl mt-4" />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={pipelineData} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={40}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--border))" }} />
                  <Area type="monotone" dataKey="Value" stroke="#6366f1" strokeWidth={2} fill="url(#valueGrad)" dot={{ fill: "#6366f1", r: 3 }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Activity feed */}
          <div className="bg-card border border-card-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold">Recent Activity</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Latest events across your workspace</p>
              </div>
              <Activity size={15} className="text-muted-foreground" />
            </div>
            {activityLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 animate-pulse bg-muted rounded-lg" />
                ))}
              </div>
            ) : activity && activity.length > 0 ? (
              <ul className="space-y-0.5" data-testid="list-activity">
                {activity.slice(0, 8).map((item) => {
                  const Icon = ACTIVITY_ICONS[item.type] ?? ArrowUpRight;
                  const colorClass = ACTIVITY_COLORS[item.type] ?? "bg-muted text-muted-foreground";
                  return (
                    <li key={item.id} data-testid={`item-activity-${item.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors group">
                      <div className={`flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 ${colorClass}`}>
                        <Icon size={13} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-foreground/90 truncate">{item.description}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground flex-shrink-0">{formatTimeAgo(item.createdAt)}</p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Activity size={18} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No activity yet</p>
                <p className="text-xs text-muted-foreground mt-1">Events will appear here as you use the app</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
