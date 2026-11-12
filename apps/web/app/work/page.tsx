"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell, PageHeader, Card, CardContent, Button, Badge } from "@pcic/ui";

type TaskStatus = "Pending" | "Submitted" | "Approved";

interface Task {
  id: number;
  title: string;
  domain: string;
  description: string;
  deadline: string;
  status: TaskStatus;
}

const STORAGE_KEY = "pcic-selected-domain";
const TASKS_STORAGE_KEY = "pcic-demo-tasks";

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Programming fundamentals",
    domain: "Code Crafters",
    description:
      "Complete introductory programming exercises and demonstrate your problem-solving skills.",
    deadline: "December 05, 2026",
    status: "Pending",
  },
  {
    id: 2,
    title: "Build your first application",
    domain: "Code Crafters",
    description:
      "Create a simple application that demonstrates your understanding of programming concepts.",
    deadline: "December 12, 2026",
    status: "Pending",
  },
  {
    id: 3,
    title: "Introduction to data analysis",
    domain: "Data Science",
    description: "Explore a dataset, identify meaningful patterns, and summarize your findings.",
    deadline: "December 05, 2026",
    status: "Pending",
  },
  {
    id: 4,
    title: "Data visualization exercise",
    domain: "Data Science",
    description: "Present useful insights from a dataset using appropriate visualization methods.",
    deadline: "December 12, 2026",
    status: "Pending",
  },
  {
    id: 5,
    title: "Cybersecurity fundamentals",
    domain: "Cyber Security",
    description:
      "Demonstrate your understanding of basic security principles and common digital threats.",
    deadline: "December 05, 2026",
    status: "Pending",
  },
  {
    id: 6,
    title: "Network security assessment",
    domain: "Cyber Security",
    description:
      "Explore basic network security concepts and identify common vulnerabilities in a safe learning environment.",
    deadline: "December 12, 2026",
    status: "Pending",
  },
];

const filters = ["All", "Pending", "Submitted", "Approved"];

export default function WorkPage() {
  const [domain, setDomain] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState("All");
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedDomain = window.localStorage.getItem(STORAGE_KEY);
    const savedTasks = window.localStorage.getItem(TASKS_STORAGE_KEY);

    if (savedDomain && ["Code Crafters", "Data Science", "Cyber Security"].includes(savedDomain)) {
      setDomain(savedDomain);
    }

    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        if (Array.isArray(parsed)) setTasks(parsed);
      } catch {
        window.localStorage.removeItem(TASKS_STORAGE_KEY);
      }
    }

    setLoaded(true);
  }, []);

  const domainTasks = useMemo(
    () => tasks.filter((task) => task.domain === domain),
    [tasks, domain],
  );

  const filteredTasks = useMemo(
    () => domainTasks.filter((task) => filter === "All" || task.status === filter),
    [domainTasks, filter],
  );

  const counts = {
    All: domainTasks.length,
    Pending: domainTasks.filter((task) => task.status === "Pending").length,
    Submitted: domainTasks.filter((task) => task.status === "Submitted").length,
    Approved: domainTasks.filter((task) => task.status === "Approved").length,
  };

  function updateTaskStatus(id: number, status: TaskStatus) {
    const updated = tasks.map((task) => (task.id === id ? { ...task, status } : task));

    setTasks(updated);
    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
  }

  const statusVariant = (status: TaskStatus) => {
    if (status === "Approved") return "ok";
    if (status === "Submitted") return "wait";
    return "attn";
  };

  if (!loaded) return null;

  return (
    <AppShell role="member">
      <main className="mx-auto w-full max-w-7xl space-y-8 px-5 py-8 md:px-8">
        <PageHeader
          eyebrow="YOUR LEARNING ACTIVITIES"
          title="Tasks & assignments"
          description="Complete your assigned activities, submit your work, and monitor mentor feedback."
        />

        {!domain ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold">Choose your learning domain first</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                Your assignments are organized according to your selected learning domain. Choose
                one domain before accessing your tasks.
              </p>
              <Button
                className="mt-5"
                onClick={() => {
                  window.location.href = "/tracks";
                }}
              >
                Explore learning domains
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    YOUR ACTIVE LEARNING DOMAIN
                  </p>
                  <h2 className="mt-1 text-lg font-semibold">{domain}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Showing assignments for your selected domain only.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.location.href = "/tracks";
                  }}
                >
                  Change domain
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: "Total tasks", value: counts.All },
                { label: "Pending", value: counts.Pending },
                { label: "Submitted", value: counts.Submitted },
                { label: "Approved", value: counts.Approved },
              ].map((item) => (
                <Card key={item.label}>
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-3xl font-semibold tabular-nums">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <section className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold">Your assignments</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select an assignment to review its details and status.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {filters.map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      filter === item
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {item} ({counts[item as keyof typeof counts]})
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <Card key={task.id}>
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={statusVariant(task.status)}>{task.status}</Badge>
                            <span className="text-xs text-muted-foreground">{domain}</span>
                          </div>

                          <h3 className="mt-3 font-semibold">{task.title}</h3>

                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {task.description}
                          </p>

                          <p className="mt-3 text-xs text-muted-foreground">
                            Deadline: {task.deadline}
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                        >
                          {expandedTask === task.id ? "Hide details" : "View details"}
                        </Button>
                      </div>

                      {expandedTask === task.id && (
                        <div className="mt-5 border-t pt-4">
                          <p className="text-sm font-medium">Assignment instructions</p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Review the requirements, complete the assigned activity, and prepare
                            your work for mentor review.
                          </p>

                          {task.status === "Pending" && (
                            <Button
                              className="mt-4"
                              onClick={() => updateTaskStatus(task.id, "Submitted")}
                            >
                              Mark as submitted
                            </Button>
                          )}

                          {task.status === "Submitted" && (
                            <p className="mt-4 text-sm text-muted-foreground">
                              Your work is awaiting mentor review.
                            </p>
                          )}

                          {task.status === "Approved" && (
                            <p className="mt-4 text-sm font-medium">This task has been approved.</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {filteredTasks.length === 0 && (
                  <div className="rounded-xl border border-dashed p-10 text-center">
                    <h3 className="font-semibold">No assignments found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      There are no tasks in this status for your selected domain.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </AppShell>
  );
}
