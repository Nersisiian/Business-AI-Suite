import { useState } from "react";
import {
  useListDeals,
  useCreateDeal,
  useUpdateDeal,
  useDeleteDeal,
  useListClients,
  getListDealsQueryKey,
  getListClientsQueryKey,
} from "@workspace/api-client-react";
import type { Deal, CreateDealBody, UpdateDealBody } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Pencil, Trash2, ChevronRight, Briefcase, X, TrendingUp } from "lucide-react";
import Layout from "@/components/Layout";

type DealStatus = "new" | "negotiation" | "won" | "lost" | "on_hold";

const STATUS_CONFIG: Record<DealStatus, { label: string; className: string; dot: string }> = {
  new: { label: "New", className: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400", dot: "bg-indigo-500" },
  negotiation: { label: "Negotiation", className: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400", dot: "bg-amber-500" },
  won: { label: "Won", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400", dot: "bg-emerald-500" },
  lost: { label: "Lost", className: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400", dot: "bg-red-500" },
  on_hold: { label: "On Hold", className: "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400", dot: "bg-violet-500" },
};

const PIPELINE_STAGES: DealStatus[] = ["new", "negotiation", "won", "lost", "on_hold"];

function DealModal({ deal, onClose }: { deal?: Deal; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: clients } = useListClients({ query: { queryKey: getListClientsQueryKey() } });

  const createMutation = useCreateDeal({
    mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListDealsQueryKey() }); onClose(); } },
  });
  const updateMutation = useUpdateDeal({
    mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListDealsQueryKey() }); onClose(); } },
  });

  const [title, setTitle] = useState(deal?.title || "");
  const [value, setValue] = useState(String(deal?.value || ""));
  const [status, setStatus] = useState<DealStatus>((deal?.status as DealStatus) || "new");
  const [clientId, setClientId] = useState(String(deal?.clientId || ""));
  const [notes, setNotes] = useState(deal?.notes || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      title,
      value: parseFloat(value) || 0,
      status,
      clientId: clientId ? Number(clientId) : null,
      notes: notes || null,
    };
    if (deal) {
      updateMutation.mutate({ id: deal.id, data: data as UpdateDealBody });
    } else {
      createMutation.mutate({ data: data as CreateDealBody });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card border border-card-border rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold">{deal ? "Edit Deal" : "New Deal"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 block mb-1.5">Title *</label>
            <input data-testid="input-deal-title" value={title} onChange={(e) => setTitle(e.target.value)} required
              placeholder="Enterprise license deal"
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 block mb-1.5">Value ($) *</label>
              <input data-testid="input-deal-value" type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} required
                placeholder="10000"
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 block mb-1.5">Stage</label>
              <select data-testid="select-deal-status" value={status} onChange={(e) => setStatus(e.target.value as DealStatus)}
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {PIPELINE_STAGES.map((s) => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 block mb-1.5">Client</label>
            <select data-testid="select-deal-client" value={clientId} onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">No client linked</option>
              {(clients || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 block mb-1.5">Notes</label>
            <textarea data-testid="input-deal-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder="Add any relevant notes…"
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex gap-2.5 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition">Cancel</button>
            <button data-testid="button-save-deal" type="submit" disabled={isPending}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition disabled:opacity-60">
              {isPending ? "Saving..." : deal ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DealsPage() {
  const { data: deals, isLoading } = useListDeals({ query: { queryKey: getListDealsQueryKey() } });
  const qc = useQueryClient();
  const deleteMutation = useDeleteDeal({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListDealsQueryKey() }) },
  });

  const [modal, setModal] = useState<null | "create" | Deal>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | DealStatus>("all");

  const filtered = (deals || []).filter(d => filterStatus === "all" || d.status === filterStatus);
  const totalValue = (deals || []).reduce((sum, d) => sum + (d.value || 0), 0);
  const wonValue = (deals || []).filter(d => d.status === "won").reduce((sum, d) => sum + (d.value || 0), 0);
  const wonCount = (deals || []).filter(d => d.status === "won").length;

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Deals</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track and manage your sales pipeline</p>
          </div>
          <button
            data-testid="button-add-deal"
            onClick={() => setModal("create")}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition shadow-sm"
          >
            <Plus size={15} />
            Add Deal
          </button>
        </div>

        {/* Summary bar */}
        <div className="flex gap-3">
          {[
            { label: "Total Pipeline", value: `$${(totalValue / 1000).toFixed(1)}k`, cls: "text-foreground" },
            { label: "Won Revenue", value: `$${(wonValue / 1000).toFixed(1)}k`, cls: "text-emerald-600" },
            { label: "Deals Won", value: wonCount, cls: "text-emerald-600" },
          ].map(({ label, value, cls }) => (
            <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-card-border text-xs">
              <span className={`font-bold text-sm ${cls}`}>{value}</span>
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Pipeline stage filter */}
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterStatus === "all" ? "bg-foreground text-background" : "bg-card border border-card-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All stages
          </button>
          {PIPELINE_STAGES.map((s) => {
            const cfg = STATUS_CONFIG[s];
            const count = (deals || []).filter(d => d.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filterStatus === s ? `${cfg.className} ring-1 ring-current/30` : "bg-card border border-card-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
                <span className="opacity-60 font-normal ml-0.5">({count})</span>
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-[60px] animate-pulse bg-muted rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Briefcase size={20} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No deals found</p>
            <p className="text-xs text-muted-foreground mt-1">Add your first deal to start tracking your pipeline</p>
          </div>
        ) : (
          <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-xs" data-testid="list-deals">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Deal</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Client</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Value</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Stage</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((deal) => {
                  const cfg = STATUS_CONFIG[deal.status as DealStatus];
                  return (
                    <tr key={deal.id} data-testid={`row-deal-${deal.id}`}
                      className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/40 flex-shrink-0">
                            <TrendingUp size={14} className="text-violet-600 dark:text-violet-400" />
                          </div>
                          <Link href={`/deals/${deal.id}`}>
                            <a className="font-medium hover:text-primary transition-colors">{deal.title}</a>
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground text-[13px]">{deal.clientName || <span className="opacity-40">—</span>}</td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-[13px]">${(deal.value || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        {cfg && (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.className}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            data-testid={`button-edit-deal-${deal.id}`}
                            onClick={() => setModal(deal)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            data-testid={`button-delete-deal-${deal.id}`}
                            onClick={() => { if (confirm(`Delete "${deal.title}"?`)) deleteMutation.mutate({ id: deal.id }); }}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                          <Link href={`/deals/${deal.id}`}>
                            <a className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                              <ChevronRight size={14} />
                            </a>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <DealModal
          deal={typeof modal === "object" && modal !== null && modal !== "create" ? modal as Deal : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </Layout>
  );
}
