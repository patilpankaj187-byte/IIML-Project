 "use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownUp, CalendarDays, Check, CheckCircle2, Circle,
  Clock3, Flag, LayoutDashboard, ListTodo, MoreHorizontal, Plus,
  Search, SlidersHorizontal, Target, Trash2, X
} from "lucide-react";

type TaskStatus = "Not started" | "In progress" | "Completed";
type Priority = "Low" | "Medium" | "High";
type Task = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  progress: number;
  createdAt: string;
};

const STORAGE_KEY = "taskflow-tasks-v1";
const today = () => new Date().toISOString().slice(0, 10);
const seedTasks: Task[] = [
  { id: "sample-1", title: "Prepare project delivery plan", description: "Define milestones, owners and delivery checkpoints.", startDate: today(), dueDate: addDays(today(), 5), priority: "High", status: "In progress", progress: 45, createdAt: new Date().toISOString() },
  { id: "sample-2", title: "Review open action items", description: "Consolidate pending actions and follow up with owners.", startDate: today(), dueDate: addDays(today(), 2), priority: "Medium", status: "Not started", progress: 0, createdAt: new Date().toISOString() },
  { id: "sample-3", title: "Share weekly status update", description: "Publish progress, risks and next week's priorities.", startDate: addDays(today(), -2), dueDate: addDays(today(), -1), priority: "Low", status: "Completed", progress: 100, createdAt: new Date().toISOString() }
];
function addDays(date: string, days: number) {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function formatDate(value: string) {
  if (!value) return "Not set";
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function isOverdue(task: Task) {
  return task.status !== "Completed" && !!task.dueDate && task.dueDate < today();
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All tasks");
  const [sortBy, setSortBy] = useState("dueDate");
  const [form, setForm] = useState({
    title: "", description: "", startDate: today(), dueDate: addDays(today(), 7),
    priority: "Medium" as Priority, status: "Not started" as TaskStatus, progress: 0
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setTasks(saved ? JSON.parse(saved) as Task[] : seedTasks);
    } catch {
      setTasks(seedTasks);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, ready]);

  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.status === "Completed").length;
    const overdue = tasks.filter(isOverdue).length;
    const active = tasks.filter(t => t.status === "In progress").length;
    const average = tasks.length ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length) : 0;
    return { total: tasks.length, completed, overdue, active, average };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    let result = tasks.filter(t => {
      const matchesQuery = `${t.title} ${t.description}`.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === "All tasks" ||
        (filter === "In progress" && t.status === "In progress") ||
        (filter === "Not started" && t.status === "Not started") ||
        (filter === "Completed" && t.status === "Completed") ||
        (filter === "Overdue" && isOverdue(t));
      return matchesQuery && matchesFilter;
    });
    result = [...result].sort((a, b) => {
      if (sortBy === "priority") return ["High", "Medium", "Low"].indexOf(a.priority) - ["High", "Medium", "Low"].indexOf(b.priority);
      if (sortBy === "createdAt") return b.createdAt.localeCompare(a.createdAt);
      return (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
    });
    return result;
  }, [tasks, query, filter, sortBy]);

  function openNew() {
    setEditing(null);
    setForm({ title: "", description: "", startDate: today(), dueDate: addDays(today(), 7), priority: "Medium", status: "Not started", progress: 0 });
    setShowModal(true);
  }
  function openEdit(task: Task) {
    setEditing(task);
    setForm({ title: task.title, description: task.description, startDate: task.startDate, dueDate: task.dueDate, priority: task.priority, status: task.status, progress: task.progress });
    setShowModal(true);
  }
  function saveTask(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const progress = form.status === "Completed" ? 100 : form.status === "Not started" && form.progress === 100 ? 0 : Number(form.progress);
    if (editing) {
      setTasks(current => current.map(t => t.id === editing.id ? { ...t, ...form, title: form.title.trim(), progress } : t));
    } else {
      setTasks(current => [{ ...form, title: form.title.trim(), progress, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...current]);
    }
    setShowModal(false);
  }
  function updateProgress(task: Task, value: number) {
    const progress = Math.max(0, Math.min(100, value));
    const status: TaskStatus = progress === 100 ? "Completed" : progress > 0 ? "In progress" : "Not started";
    setTasks(current => current.map(t => t.id === task.id ? { ...t, progress, status } : t));
  }
  function removeTask(id: string) {
    if (window.confirm("Delete this task? This cannot be undone.")) setTasks(current => current.filter(t => t.id !== id));
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Check size={19} strokeWidth={3} /></div><span>taskflow</span></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="nav-list">
          <button className="nav-item active"><LayoutDashboard size={18} /> Overview</button>
          <button className="nav-item" onClick={() => setFilter("All tasks")}><ListTodo size={18} /> All tasks <span className="nav-count">{tasks.length}</span></button>
          <button className="nav-item" onClick={() => setFilter("In progress")}><Activity size={18} /> In progress</button>
          <button className="nav-item" onClick={() => setFilter("Completed")}><CheckCircle2 size={18} /> Completed</button>
          <button className="nav-item" onClick={() => setFilter("Overdue")}><Clock3 size={18} /> Overdue</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="tip-card">
            <div className="tip-icon"><Target size={18}/></div>
            <strong>Make progress visible</strong>
            <p>Break work into clear milestones and update progress as you go.</p>
          </div>
          <div className="profile"><div className="avatar">Y</div><div><strong>Your workspace</strong><span>Personal account</span></div><MoreHorizontal size={18} className="profile-more"/></div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>Overview</strong></div>
          <div className="top-actions"><span className="today-label"><CalendarDays size={15}/>{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span><button className="primary-btn" onClick={openNew}><Plus size={17}/> New task</button></div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div><div className="eyebrow">YOUR PRODUCTIVITY HUB</div><h1>Good work starts with a plan.</h1><p>Keep your priorities clear and your projects moving forward.</p></div>
            <button className="primary-btn mobile-add" onClick={openNew}><Plus size={17}/> New task</button>
          </div>

          <div className="stats-grid">
            <StatCard label="Total tasks" value={stats.total} note="Across your workspace" icon={<ListTodo size={18}/>} tone="blue"/>
            <StatCard label="In progress" value={stats.active} note="Work currently moving" icon={<Activity size={18}/>} tone="purple"/>
            <StatCard label="Completed" value={stats.completed} note={`${stats.total ? Math.round(stats.completed / stats.total * 100) : 0}% of all tasks`} icon={<CheckCircle2 size={18}/>} tone="green"/>
            <StatCard label="Overdue" value={stats.overdue} note="Needs your attention" icon={<Clock3 size={18}/>} tone="orange"/>
          </div>

          <section className="progress-panel">
            <div className="progress-copy"><div className="progress-icon"><Target size={19}/></div><div><strong>Overall progress</strong><span>Average completion across all tasks</span></div></div>
            <div className="overall-progress"><div className="overall-track"><div className="overall-fill" style={{ width: `${stats.average}%` }}/></div><strong>{stats.average}%</strong></div>
          </section>

          <section className="tasks-section">
            <div className="section-heading"><div><h2>Tasks</h2><p>Manage your work and keep track of what’s next.</p></div><span className="task-total">{visibleTasks.length} tasks</span></div>
            <div className="toolbar">
              <div className="search-box"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tasks..." /></div>
              <div className="toolbar-right"><div className="filter-control"><SlidersHorizontal size={16}/><select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter tasks"><option>All tasks</option><option>In progress</option><option>Not started</option><option>Completed</option><option>Overdue</option></select></div><div className="filter-control"><ArrowDownUp size={16}/><select value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Sort tasks"><option value="dueDate">Due date</option><option value="priority">Priority</option><option value="createdAt">Recently added</option></select></div></div>
            </div>

            <div className="task-list">
              {!ready ? <div className="empty-state">Loading your tasks…</div> : visibleTasks.length === 0 ? (
                <div className="empty-state"><div className="empty-icon"><ListTodo size={24}/></div><strong>No tasks found</strong><span>Try changing your search or add a new task.</span><button className="text-button" onClick={openNew}>Create your first task</button></div>
              ) : visibleTasks.map(task => <TaskRow key={task.id} task={task} onEdit={() => openEdit(task)} onDelete={() => removeTask(task.id)} onProgress={value => updateProgress(task, value)}/>)}
            </div>
          </section>
          <footer className="footer-note">Your tasks are saved in this browser. <span>TaskFlow · Simple planning, steady progress.</span></footer>
        </div>
      </section>

      {showModal && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
        <form className="task-modal" onSubmit={saveTask}>
          <div className="modal-heading"><div><div className="eyebrow">{editing ? "UPDATE YOUR WORK" : "ADD TO YOUR WORKSPACE"}</div><h2>{editing ? "Edit task" : "Create a new task"}</h2></div><button type="button" className="icon-btn" onClick={() => setShowModal(false)} aria-label="Close"><X size={19}/></button></div>
          <label className="field-label">Task name <span>*</span><input required autoFocus maxLength={100} placeholder="e.g. Finalise project plan" value={form.title} onChange={e => setForm({...form, title: e.target.value})}/></label>
          <label className="field-label">Description <textarea rows={3} placeholder="Add a few details about this task..." value={form.description} onChange={e => setForm({...form, description: e.target.value})}/></label>
          <div className="form-grid">
            <label className="field-label">Start date<input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})}/></label>
            <label className="field-label">Due date<input type="date" min={form.startDate || undefined} value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})}/></label>
            <label className="field-label">Priority<select value={form.priority} onChange={e => setForm({...form, priority: e.target.value as Priority})}><option>Low</option><option>Medium</option><option>High</option></select></label>
            <label className="field-label">Status<select value={form.status} onChange={e => setForm({...form, status: e.target.value as TaskStatus, progress: e.target.value === "Completed" ? 100 : e.target.value === "Not started" ? 0 : Math.max(1, form.progress)})}><option>Not started</option><option>In progress</option><option>Completed</option></select></label>
          </div>
          <label className="field-label progress-field">Progress <div className="range-line"><input type="range" min="0" max="100" step="5" value={form.status === "Completed" ? 100 : form.progress} disabled={form.status === "Completed"} onChange={e => setForm({...form, progress: Number(e.target.value), status: Number(e.target.value) === 0 ? "Not started" : "In progress"})}/><strong>{form.status === "Completed" ? 100 : form.progress}%</strong></div></label>
          <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>Cancel</button><button className="primary-btn" type="submit">{editing ? "Save changes" : "Create task"}</button></div>
        </form>
      </div>}
    </main>
  );
}

function StatCard({ label, value, note, icon, tone }: { label: string; value: number; note: string; icon: React.ReactNode; tone: string }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>;
}

function TaskRow({ task, onEdit, onDelete, onProgress }: { task: Task; onEdit: () => void; onDelete: () => void; onProgress: (value: number) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const overdue = isOverdue(task);
  return <article className="task-row">
    <div className="task-main">
      <div className={`task-check ${task.status === "Completed" ? "checked" : ""}`}>{task.status === "Completed" ? <Check size={14}/> : <Circle size={16}/>}</div>
      <div className="task-info"><div className="task-title-line"><button className={`task-title ${task.status === "Completed" ? "done" : ""}`} onClick={onEdit}>{task.title}</button><span className={`priority ${task.priority.toLowerCase()}`}><Flag size={11}/>{task.priority}</span></div>
        {task.description && <p className="task-description">{task.description}</p>}
        <div className="task-meta"><span><CalendarDays size={13}/>{formatDate(task.startDate)} – {formatDate(task.dueDate)}</span><span className={`status-pill ${task.status.toLowerCase().replace(" ", "-")}`}>{task.status}</span>{overdue && <span className="overdue-label">Overdue</span>}</div>
      </div>
    </div>
    <div className="task-progress"><div className="task-progress-top"><span>Progress</span><strong>{task.progress}%</strong></div><div className="task-track"><div className="task-fill" style={{width: `${task.progress}%`}}/></div><input aria-label={`Update progress for ${task.title}`} type="range" min="0" max="100" step="5" value={task.progress} onChange={e => onProgress(Number(e.target.value))}/></div>
    <div className="task-menu-wrap"><button className="icon-btn task-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Task options"><MoreHorizontal size={19}/></button>{menuOpen && <div className="dropdown"><button onClick={() => { onEdit(); setMenuOpen(false); }}>Edit task</button><button className="delete-option" onClick={() => { onDelete(); setMenuOpen(false); }}><Trash2 size={14}/> Delete</button></div>}</div>
  </article>;
}
