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
import { Plus, Pencil, Trash2, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";

type DealStatus = "new" | "negotiation" | "won" | "lost" | "on_hold";

const STATUS_CONFIG: Record<DealStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  negotiation: { label: "Negotiation", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" },
  won: { label: "Won", className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
  lost: { label: "Lost", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  on_hold: { label: "On Hold", className: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" },
};

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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card border border-card-border rounded-xl p-6 w-full max-w-md shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-base font-semibold mb-5">{deal ? "Edit Deal" : "Add Deal"}</h2>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Title *</label>
            <input data-testid="input-deal-title" value={title} onChange={(e) => setTitle(e.target.value)} required
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Value ($) *</label>
              <input data-testid="input-deal-value" type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Status</label>
              <select data-testid="select-deal-status" value={status} onChange={(e) => setStatus(e.target.value as DealStatus)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Client</label>
            <select data-testid="select-deal-client" value={clientId} onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">No client linked</option>
              {(clients || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Notes</label>
            <textarea data-testid="input-deal-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition">Cancel</button>
            <button data-testid="button-save-deal" type="submit" disabled={isPending}
              className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-60">
              {isPending ? "Saving..." : "Save"}
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

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Deals</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track your sales pipeline</p>
          </div>
          <button
            data-testid="button-add-deal"
            onClick={() => setModal("create")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
          >
            <Plus size={15} />
            Add Deal
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 animate-pulse bg-muted rounded-xl" />)}
          </div>
        ) : !deals || deals.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">No deals yet. Add your first deal.</p>
          </div>
        ) : (
          <div className="bg-card border border-card-border rounded-xl overflow-hidden shadow-xs" data-testid="list-deals">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Value</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => {
                  const cfg = STATUS_CONFIG[deal.status as DealStatus];
                  return (
                    <tr key={deal.id} data-testid={`row-deal-${deal.id}`} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/deals/${deal.id}`}>
                          <a className="font-medium hover:text-primary transition-colors">{deal.title}</a>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{deal.clientName || "—"}</td>
                      <td className="px-4 py-3 font-medium">${(deal.value || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg?.className || ""}`}>
                          {cfg?.label || deal.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            data-testid={`button-edit-deal-${deal.id}`}
                            onClick={() => setModal(deal)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            data-testid={`button-delete-deal-${deal.id}`}
                            onClick={() => { if (confirm(`Delete "${deal.title}"?`)) deleteMutation.mutate({ id: deal.id }); }}
                            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                          <Link href={`/deals/${deal.id}`}>
                            <a className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
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
