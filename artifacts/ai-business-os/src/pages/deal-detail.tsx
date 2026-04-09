import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import {
  useGetDeal,
  useAnalyzeDeal,
  getGetDealQueryKey,
} from "@workspace/api-client-react";
import { ArrowLeft, Brain, TrendingUp, AlertCircle } from "lucide-react";
import Layout from "@/components/Layout";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  new: { label: "New", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  negotiation: { label: "Negotiation", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" },
  won: { label: "Won", className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
  lost: { label: "Lost", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  on_hold: { label: "On Hold", className: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" },
};

export default function DealDetailPage() {
  const [, params] = useRoute("/deals/:id");
  const [, setLocation] = useLocation();
  const id = Number(params?.id);

  const { data: deal, isLoading } = useGetDeal(id, { query: { enabled: !!id, queryKey: getGetDealQueryKey(id) } });

  const [analysis, setAnalysis] = useState<{ probability: number; reasoning: string; recommendations: string[] } | null>(null);

  const analyzeMutation = useAnalyzeDeal({
    mutation: {
      onSuccess: (data) => setAnalysis(data),
    },
  });

  function handleAnalyze() {
    if (!deal) return;
    analyzeMutation.mutate({
      data: {
        dealId: deal.id,
        title: deal.title,
        value: deal.value,
        status: deal.status,
        notes: deal.notes || null,
        clientName: deal.clientName || null,
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

  if (!deal) {
    return (
      <Layout>
        <div className="p-6 text-center py-20 text-muted-foreground">
          <p className="text-sm">Deal not found.</p>
        </div>
      </Layout>
    );
  }

  const cfg = STATUS_CONFIG[deal.status];
  const probabilityColor = analysis
    ? analysis.probability >= 70 ? "text-green-600" : analysis.probability >= 40 ? "text-yellow-600" : "text-red-600"
    : "";

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <button
          data-testid="button-back"
          onClick={() => setLocation("/deals")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Deals
        </button>

        <div className="bg-card border border-card-border rounded-xl p-6 shadow-xs mb-5">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-xl font-semibold" data-testid="text-deal-title">{deal.title}</h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg?.className || ""}`}>
              {cfg?.label || deal.status}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-5 mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Value</p>
              <p className="text-lg font-semibold" data-testid="text-deal-value">${(deal.value || 0).toLocaleString()}</p>
            </div>
            {deal.clientName && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Client</p>
                <p className="text-sm font-medium">{deal.clientName}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Created</p>
              <p className="text-sm">{new Date(deal.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
            </div>
          </div>
          {deal.notes && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">Notes</p>
              <p className="text-sm" data-testid="text-deal-notes">{deal.notes}</p>
            </div>
          )}
        </div>

        <div className="bg-card border border-card-border rounded-xl p-6 shadow-xs" data-testid="card-ai-analysis">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
                <Brain size={14} className="text-primary" />
              </div>
              <h2 className="text-sm font-semibold">AI Deal Analysis</h2>
            </div>
            <button
              data-testid="button-analyze-deal"
              onClick={handleAnalyze}
              disabled={analyzeMutation.isPending}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
            >
              <TrendingUp size={14} />
              {analyzeMutation.isPending ? "Analyzing..." : "Analyze Deal"}
            </button>
          </div>

          {!analysis && !analyzeMutation.isPending && (
            <p className="text-sm text-muted-foreground">Click Analyze Deal to get AI-powered insights about this deal's success probability and recommendations.</p>
          )}

          {analyzeMutation.isPending && (
            <div className="space-y-2">
              <div className="h-5 animate-pulse bg-muted rounded w-3/4" />
              <div className="h-5 animate-pulse bg-muted rounded w-full" />
              <div className="h-5 animate-pulse bg-muted rounded w-2/3" />
            </div>
          )}

          {analysis && (
            <div className="space-y-4" data-testid="analysis-result">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className={`text-3xl font-bold ${probabilityColor}`} data-testid="text-probability">{analysis.probability}%</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Success probability</p>
                </div>
                <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      analysis.probability >= 70 ? "bg-green-500" :
                      analysis.probability >= 40 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${analysis.probability}%` }}
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1.5">Analysis</p>
                <p className="text-sm" data-testid="text-reasoning">{analysis.reasoning}</p>
              </div>

              {analysis.recommendations.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Recommendations</p>
                  <ul className="space-y-1.5" data-testid="list-recommendations">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <AlertCircle size={14} className="text-primary mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
