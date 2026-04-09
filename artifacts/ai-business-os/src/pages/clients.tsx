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
import { Plus, Search, Pencil, Trash2, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";

type ClientStatus = "active" | "inactive" | "prospect";

const STATUS_COLORS: Record<ClientStatus, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  prospect: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
};

function ClientModal({
  client,
  onClose,
}: {
  client?: Client;
  onClose: () => void;
}) {
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card border border-card-border rounded-xl p-6 w-full max-w-md shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-base font-semibold mb-5">{client ? "Edit Client" : "Add Client"}</h2>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Name *</label>
              <input data-testid="input-client-name" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Email *</label>
              <input data-testid="input-client-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Phone</label>
              <input data-testid="input-client-phone" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Company</label>
              <input data-testid="input-client-company" value={company} onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Status</label>
            <select data-testid="select-client-status" value={status} onChange={(e) => setStatus(e.target.value as ClientStatus)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="prospect">Prospect</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition">Cancel</button>
            <button data-testid="button-save-client" type="submit" disabled={isPending}
              className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-60">
              {isPending ? "Saving..." : "Save"}
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

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Clients</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your client relationships</p>
          </div>
          <button
            data-testid="button-add-client"
            onClick={() => setModal("create")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
          >
            <Plus size={15} />
            Add Client
          </button>
        </div>

        <div className="relative mb-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            data-testid="input-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 animate-pulse bg-muted rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">No clients found.</p>
          </div>
        ) : (
          <div className="bg-card border border-card-border rounded-xl overflow-hidden shadow-xs" data-testid="list-clients">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => (
                  <tr key={client.id} data-testid={`row-client-${client.id}`} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/clients/${client.id}`}>
                        <a className="font-medium hover:text-primary transition-colors">{client.name}</a>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{client.company || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[client.status as ClientStatus] || ""}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{client.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          data-testid={`button-edit-client-${client.id}`}
                          onClick={() => setModal(client)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          data-testid={`button-delete-client-${client.id}`}
                          onClick={() => { if (confirm(`Delete ${client.name}?`)) deleteMutation.mutate({ id: client.id }); }}
                          className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                        <Link href={`/clients/${client.id}`}>
                          <a className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                            <ChevronRight size={14} />
                          </a>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
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
