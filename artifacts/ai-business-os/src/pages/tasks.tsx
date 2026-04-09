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
import { Plus, Pencil, Trash2, CheckCircle2, Circle, Clock } from "lucide-react";
import Layout from "@/components/Layout";

type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high";

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: React.ComponentType<any>; className: string }> = {
  todo: { label: "To Do", icon: Circle, className: "text-muted-foreground" },
  in_progress: { label: "In Progress", icon: Clock, className: "text-yellow-600" },
  done: { label: "Done", icon: CheckCircle2, className: "text-green-600" },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  medium: { label: "Medium", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  high: { label: "High", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
};

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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card border border-card-border rounded-xl p-6 w-full max-w-md shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-base font-semibold mb-5">{task ? "Edit Task" : "Add Task"}</h2>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Title *</label>
            <input data-testid="input-task-title" value={title} onChange={(e) => setTitle(e.target.value)} required
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Description</label>
            <textarea data-testid="input-task-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Status</label>
              <select data-testid="select-task-status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Priority</label>
              <select data-testid="select-task-priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Deadline</label>
            <input type="date" data-testid="input-task-deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Client</label>
              <select data-testid="select-task-client" value={clientId} onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">None</option>
                {(clients || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Deal</label>
              <select data-testid="select-task-deal" value={dealId} onChange={(e) => setDealId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">None</option>
                {(deals || []).map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition">Cancel</button>
            <button data-testid="button-save-task" type="submit" disabled={isPending}
              className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-60">
              {isPending ? "Saving..." : "Save"}
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

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Tasks</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Stay on top of your action items</p>
          </div>
          <button
            data-testid="button-add-task"
            onClick={() => setModal("create")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
          >
            <Plus size={15} />
            Add Task
          </button>
        </div>

        <div className="flex gap-1.5 mb-4">
          {(["all", "todo", "in_progress", "done"] as const).map((f) => (
            <button
              key={f}
              data-testid={`filter-${f}`}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "All" : f === "in_progress" ? "In Progress" : f === "todo" ? "To Do" : "Done"}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 animate-pulse bg-muted rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">No tasks found.</p>
          </div>
        ) : (
          <div className="space-y-2" data-testid="list-tasks">
            {filtered.map((task) => {
              const statusCfg = STATUS_CONFIG[task.status as TaskStatus];
              const priorityCfg = PRIORITY_CONFIG[task.priority as TaskPriority];
              const StatusIcon = statusCfg?.icon || Circle;
              return (
                <div
                  key={task.id}
                  data-testid={`card-task-${task.id}`}
                  className="bg-card border border-card-border rounded-xl px-4 py-3.5 flex items-center gap-4 shadow-xs hover:shadow-sm transition-shadow"
                >
                  <button
                    data-testid={`button-toggle-task-${task.id}`}
                    onClick={() => {
                      const nextStatus: TaskStatus = task.status === "done" ? "todo" : task.status === "todo" ? "in_progress" : "done";
                      updateMutation.mutate({ id: task.id, data: { status: nextStatus } });
                    }}
                    className={`flex-shrink-0 ${statusCfg?.className || ""}`}
                  >
                    <StatusIcon size={18} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`} data-testid={`text-task-title-${task.id}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      {task.deadline && (
                        <span className="text-xs text-muted-foreground">
                          Due {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${priorityCfg?.className || ""}`}>
                    {priorityCfg?.label || task.priority}
                  </span>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      data-testid={`button-edit-task-${task.id}`}
                      onClick={() => setModal(task)}
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      data-testid={`button-delete-task-${task.id}`}
                      onClick={() => { if (confirm(`Delete "${task.title}"?`)) deleteMutation.mutate({ id: task.id }); }}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
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
