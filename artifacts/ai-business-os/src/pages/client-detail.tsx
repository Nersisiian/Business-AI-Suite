import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import {
  useGetClient,
  useSuggestReply,
  getGetClientQueryKey,
} from "@workspace/api-client-react";
import { ArrowLeft, MessageSquare, Zap, Phone, Mail, Building } from "lucide-react";
import Layout from "@/components/Layout";

export default function ClientDetailPage() {
  const [, params] = useRoute("/clients/:id");
  const [, setLocation] = useLocation();
  const id = Number(params?.id);

  const { data: client, isLoading } = useGetClient(id, { query: { enabled: !!id, queryKey: getGetClientQueryKey(id) } });

  const [message, setMessage] = useState("");
  const [context, setContext] = useState("");
  const [suggestedReply, setSuggestedReply] = useState("");

  const suggestMutation = useSuggestReply({
    mutation: {
      onSuccess: (data) => setSuggestedReply(data.reply),
    },
  });

  function handleSuggestReply(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    suggestMutation.mutate({
      data: {
        clientMessage: message,
        clientName: client?.name || null,
        context: context || null,
      },
    });
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="h-8 w-48 animate-pulse bg-muted rounded mb-6" />
          <div className="h-48 animate-pulse bg-muted rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (!client) {
    return (
      <Layout>
        <div className="p-6 text-center py-20 text-muted-foreground">
          <p className="text-sm">Client not found.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <button
          data-testid="button-back"
          onClick={() => setLocation("/clients")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Clients
        </button>

        <div className="bg-card border border-card-border rounded-xl p-6 shadow-xs mb-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold" data-testid="text-client-name">{client.name}</h1>
              {client.company && <p className="text-sm text-muted-foreground mt-0.5">{client.company}</p>}
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
              client.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" :
              client.status === "inactive" ? "bg-gray-100 text-gray-600" :
              "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
            }`}>
              {client.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail size={14} />
              <span data-testid="text-client-email">{client.email}</span>
            </div>
            {client.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone size={14} />
                <span data-testid="text-client-phone">{client.phone}</span>
              </div>
            )}
            {client.company && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building size={14} />
                <span>{client.company}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Added {new Date(client.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-6 shadow-xs" data-testid="card-ai-reply">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
              <Zap size={14} className="text-primary" />
            </div>
            <h2 className="text-sm font-semibold">AI Reply Suggestion</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Paste a client message and get an AI-powered suggested reply.</p>

          <form onSubmit={handleSuggestReply} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Client message</label>
              <textarea
                data-testid="input-client-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Paste the client's message here..."
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Context (optional)</label>
              <input
                data-testid="input-context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. discussing renewal, pricing negotiation..."
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              data-testid="button-suggest-reply"
              type="submit"
              disabled={suggestMutation.isPending || !message.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
            >
              <MessageSquare size={14} />
              {suggestMutation.isPending ? "Generating..." : "Suggest Reply"}
            </button>
          </form>

          {suggestedReply && (
            <div className="mt-4 p-4 rounded-lg bg-accent border border-accent-foreground/10" data-testid="text-suggested-reply">
              <p className="text-xs font-semibold text-accent-foreground mb-2">Suggested Reply</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{suggestedReply}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
