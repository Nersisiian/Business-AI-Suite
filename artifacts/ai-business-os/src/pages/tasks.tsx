import { useState } from "react";
import {
  useListTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useListClients,
  useListDeals,
  getListTasksQueryKey,
  getListClientsQueryKey,
  getListDealsQueryKey,
} from "@workspace/api-client-react";
import type { Task, CreateTaskBody, UpdateTaskBody } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, CheckCircle2, Circle, Clock, CalendarDays, CheckSquare, X, AlertCircle } from "lucide-react";
import Layout from "@/components/Layout";

type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high";

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: React.ComponentType<any>; iconClass: string; badge: string }> = {
  todo: { label: "To Do", icon: Circle, iconClass: "text-slate-400 hover:text-slate-600", badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  in_progress: { label: "In Progress", icon: Clock, iconClass: "text-amber-500 hover:text-amber-600", badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" },
  done: { label: "Done", icon: CheckCircle2, iconClass: "text-emerald-500 hover:text-emerald-600", badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; className: string; dot: string }> = {
  low: { label: "Low", className: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400", dot: "bg-slate-400" },
  medium: { label: "Medium", className: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400", dot: "bg-indigo-500" },
  high: { label: "High", className: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400", dot: "bg-red-500" },
};

function isOverdue(deadline?: string | null) {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

function TaskModal({ task, onClose }: { task?: Task; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: clients } = useListClients({ query: { queryKey: getListClientsQueryKey() } });
  const { data: deals } = useListDeals({ query: { queryKey: getListDealsQueryKey() } });

  const createMutation = useCreateTask({
    mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListTasksQueryKey() }); onClose(); } },
  });
  const updateMutation = useUpdateTask({
    mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListTasksQueryKey() }); onClose(); } },
  });

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState<TaskStatus>((task?.status as TaskStatus) || "todo");
  const [priority, setPriority] = useState<TaskPriority>((task?.priority as TaskPriority) || "medium");
  const [deadline, setDeadline] = useState(task?.deadline || "");
  const [clientId, setClientId] = useState(String(task?.clientId || ""));
  const [dealId, setDealId] = useState(String(task?.dealId || ""));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      title,
      description: description || null,
      status,
      priority,
      deadline: deadline || null,
      clientId: clientId ? Number(clientId) : null,
      dealId: dealId ? Number(dealId) : null,
    };
    if (task) {
      updateMutation.mutate({ id: task.id, data: data as UpdateTaskBody });
    } else {
      createMutation.mutate({ data: data as CreateTaskBody });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card border border-card-border rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold">{task ? "Edit Task" : "New Task"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 block mb-1.5">Title *</label>
            <input data-testid="input-task-title" value={title} onChange={(e) => setTitle(e.target.value)} required
              placeholder="Follow up with client"
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 block mb-1.5">Description</label>
            <textarea data-testid="input-task-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              placeholder="Add context or details…"
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 block mb-1.5">Status</label>
              <select data-testid="select-task-status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 block mb-1.5">Priority</label>
              <select data-testid="select-task-priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 block mb-1.5">Deadline</label>
            <input type="date" data-testid="input-task-deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 block mb-1.5">Client</label>
              <select data-testid="select-task-client" value={clientId} onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">None</option>
                {(clients || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 block mb-1.5">Deal</label>
              <select data-testid="select-task-deal" value={dealId} onChange={(e) => setDealId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">None</option>
                {(deals || []).map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2.5 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition">Cancel</button>
            <button data-testid="button-save-task" type="submit" disabled={isPending}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition disabled:opacity-60">
              {isPending ? "Saving..." : task ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { data: tasks, isLoading } = useListTasks({ query: { queryKey: getListTasksQueryKey() } });
  const qc = useQueryClient();
  const deleteMutation = useDeleteTask({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListTasksQueryKey() }) },
  });
  const updateMutation = useUpdateTask({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListTasksQueryKey() }) },
  });

  const [modal, setModal] = useState<null | "create" | Task>(null);
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");

  const filtered = (tasks || []).filter((t) => filter === "all" || t.status === filter);

  const counts = {
    all: (tasks || []).length,
    todo: (tasks || []).filter(t => t.status === "todo").length,
    in_progress: (tasks || []).filter(t => t.status === "in_progress").length,
    done: (tasks || []).filter(t => t.status === "done").length,
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Tasks</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Stay on top of your action items</p>
          </div>
          <button
            data-testid="button-add-task"
            onClick={() => setModal("create")}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition shadow-sm"
          >
            <Plus size={15} />
            Add Task
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5">
          {([
            { key: "all", label: "All" },
            { key: "todo", label: "To Do" },
            { key: "in_progress", label: "In Progress" },
            { key: "done", label: "Done" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              data-testid={`filter-${key}`}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium transition ${
                filter === key
                  ? "bg-foreground text-background"
                  : "bg-card border border-card-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
              <span className={`text-[11px] font-normal ${filter === key ? "opacity-60" : "opacity-50"}`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-[68px] animate-pulse bg-muted rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <CheckSquare size={20} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No tasks found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {filter !== "all" ? "No tasks in this stage" : "Add your first task to get started"}
            </p>
          </div>
        ) : (
          <div className="space-y-2" data-testid="list-tasks">
            {filtered.map((task) => {
              const statusCfg = STATUS_CONFIG[task.status as TaskStatus];
              const priorityCfg = PRIORITY_CONFIG[task.priority as TaskPriority];
              const StatusIcon = statusCfg?.icon || Circle;
              const overdue = isOverdue(task.deadline) && task.status !== "done";

              return (
                <div
                  key={task.id}
                  data-testid={`card-task-${task.id}`}
                  className="bg-card border border-card-border rounded-2xl px-4 py-3.5 flex items-center gap-4 shadow-xs hover:shadow-sm transition-all group"
                >
                  <button
                    data-testid={`button-toggle-task-${task.id}`}
                    onClick={() => {
                      const nextStatus: TaskStatus = task.status === "done" ? "todo" : task.status === "todo" ? "in_progress" : "done";
                      updateMutation.mutate({ id: task.id, data: { status: nextStatus } });
                    }}
                    className={`flex-shrink-0 transition-colors ${statusCfg?.iconClass || "text-muted-foreground"}`}
                    title={`Mark as ${task.status === "done" ? "todo" : task.status === "todo" ? "in progress" : "done"}`}
                  >
                    <StatusIcon size={19} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-[13px] font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}
                        data-testid={`text-task-title-${task.id}`}>
                        {task.title}
                      </p>
                      {overdue && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded-md">
                          <AlertCircle size={9} />
                          Overdue
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-md">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      {task.deadline && (
                        <span className={`flex items-center gap-1 text-[11px] ${overdue ? "text-red-500" : "text-muted-foreground"}`}>
                          <CalendarDays size={10} />
                          {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {priorityCfg && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${priorityCfg.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot}`} />
                        {priorityCfg.label}
                      </span>
                    )}

                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        data-testid={`button-edit-task-${task.id}`}
                        onClick={() => setModal(task)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        data-testid={`button-delete-task-${task.id}`}
                        onClick={() => { if (confirm(`Delete "${task.title}"?`)) deleteMutation.mutate({ id: task.id }); }}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal !== null && (
        <TaskModal
          task={typeof modal === "object" && modal !== null && modal !== "create" ? modal as Task : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </Layout>
  );
}
