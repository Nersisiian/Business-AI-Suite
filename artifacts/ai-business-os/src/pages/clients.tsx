import { useState } from "react";
import {
  useListClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  getListClientsQueryKey,
} from "@workspace/api-client-react";
import type { Client, CreateClientBody, UpdateClientBody } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Search, Pencil, Trash2, ChevronRight, Users, X } from "lucide-react";
import Layout from "@/components/Layout";

type ClientStatus = "active" | "inactive" | "prospect";

const STATUS_CONFIG: Record<ClientStatus, { label: string; className: string; dot: string }> = {
  active: { label: "Active", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400", dot: "bg-emerald-500" },
  inactive: { label: "Inactive", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", dot: "bg-slate-400" },
  prospect: { label: "Prospect", className: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400", dot: "bg-indigo-500" },
};

function getInitials(name: string) {
  const p = name.trim().split(" ");
  return p.length >= 2 ? p[0][0] + p[1][0] : name.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function ClientModal({ client, onClose }: { client?: Client; onClose: () => void }) {
  const qc = useQueryClient();
  const createMutation = useCreateClient({
    mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListClientsQueryKey() }); onClose(); } },
  });
  const updateMutation = useUpdateClient({
    mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListClientsQueryKey() }); onClose(); } },
  });

  const [name, setName] = useState(client?.name || "");
  const [email, setEmail] = useState(client?.email || "");
  const [phone, setPhone] = useState(client?.phone || "");
  const [company, setCompany] = useState(client?.company || "");
  const [status, setStatus] = useState<ClientStatus>((client?.status as ClientStatus) || "prospect");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { name, email, phone: phone || null, company: company || null, status };
    if (client) {
      updateMutation.mutate({ id: client.id, data: data as UpdateClientBody });
    } else {
      createMutation.mutate({ data: data as CreateClientBody });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card border border-card-border rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold">{client ? "Edit Client" : "New Client"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 block mb-1.5">Name *</label>
              <input data-testid="input-client-name" value={name} onChange={(e) => setName(e.target.value)} required
                placeholder="Jane Smith"
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 block mb-1.5">Email *</label>
              <input data-testid="input-client-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="jane@company.com"
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 block mb-1.5">Phone</label>
              <input data-testid="input-client-phone" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 0100"
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 block mb-1.5">Company</label>
              <input data-testid="input-client-company" value={company} onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Inc."
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 block mb-1.5">Status</label>
            <select data-testid="select-client-status" value={status} onChange={(e) => setStatus(e.target.value as ClientStatus)}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="prospect">Prospect</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-2.5 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition">Cancel</button>
            <button data-testid="button-save-client" type="submit" disabled={isPending}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition disabled:opacity-60">
              {isPending ? "Saving..." : client ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const { data: clients, isLoading } = useListClients({ query: { queryKey: getListClientsQueryKey() } });
  const qc = useQueryClient();
  const deleteMutation = useDeleteClient({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListClientsQueryKey() }) },
  });

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<null | "create" | Client>(null);

  const filtered = (clients || []).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.company || "").toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    active: (clients || []).filter(c => c.status === "active").length,
    prospect: (clients || []).filter(c => c.status === "prospect").length,
    inactive: (clients || []).filter(c => c.status === "inactive").length,
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Clients</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage and track your client relationships</p>
          </div>
          <button
            data-testid="button-add-client"
            onClick={() => setModal("create")}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition shadow-sm"
          >
            <Plus size={15} />
            Add Client
          </button>
        </div>

        {/* Stats mini row */}
        <div className="flex gap-3">
          {[
            { label: "Active", count: counts.active, cls: "text-emerald-600" },
            { label: "Prospects", count: counts.prospect, cls: "text-indigo-600" },
            { label: "Inactive", count: counts.inactive, cls: "text-muted-foreground" },
          ].map(({ label, count, cls }) => (
            <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-card-border text-xs">
              <span className={`font-bold text-sm ${cls}`}>{count}</span>
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            data-testid="input-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or company…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring shadow-xs"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-[60px] animate-pulse bg-muted rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Users size={20} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No clients found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search ? "Try a different search term" : "Add your first client to get started"}
            </p>
          </div>
        ) : (
          <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-xs" data-testid="list-clients">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Client</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Company</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => {
                  const cfg = STATUS_CONFIG[client.status as ClientStatus];
                  return (
                    <tr key={client.id} data-testid={`row-client-${client.id}`}
                      className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold flex-shrink-0 ${avatarColor(client.id)}`}>
                            {getInitials(client.name)}
                          </div>
                          <Link href={`/clients/${client.id}`} className="font-medium hover:text-primary transition-colors">{client.name}</Link>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground text-[13px]">{client.company || <span className="text-muted-foreground/40">—</span>}</td>
                      <td className="px-4 py-3.5">
                        {cfg && (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.className}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground text-[13px]">{client.email}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            data-testid={`button-edit-client-${client.id}`}
                            onClick={() => setModal(client)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            data-testid={`button-delete-client-${client.id}`}
                            onClick={() => { if (confirm(`Delete ${client.name}?`)) deleteMutation.mutate({ id: client.id }); }}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                          <Link href={`/clients/${client.id}`} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                            <ChevronRight size={14} />
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
        <ClientModal
          client={typeof modal === "object" && modal !== null && modal !== "create" ? modal as Client : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </Layout>
  );
}
