"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell, PageHeader, Card, CardContent, Button, Badge } from "@pcic/ui";

type TaskStatus = "Pending" | "Submitted" | "Approved";

interface Task {
  id: string;
  title: string;
  domain: string;
  description: string;
  deadline: string;
  status: TaskStatus;
}

const DOMAINS = ["Code Crafters", "Data Science", "Cyber Security"];
const DOMAIN_KEY = "pcic-selected-domain";
const TASKS_KEY = "pcic-demo-tasks";

const achievements = [
  {
    title: "First Submission",
    description: "Submit your first learning task.",
    requirement: 1,
  },
  {
    title: "First Approval",
    description: "Get your first task approved by a mentor.",
    requirement: 1,
  },
  {
    title: "Consistent Learner",
    description: "Get three tasks approved.",
    requirement: 3,
  },
  {
    title: "Halfway Milestone",
    description: "Get five tasks approved.",
    requirement: 5,
  },
];

export default function ProgressPage() {
  const [domain, setDomain] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedDomain = localStorage.getItem(DOMAIN_KEY);
    const savedTasks = localStorage.getItem(TASKS_KEY);

    if (savedDomain && DOMAINS.includes(savedDomain)) {
      setDomain(savedDomain);
    }

    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        if (Array.isArray(parsed)) {
          setTasks(parsed);
        }
      } catch {
        setTasks([]);
      }
    }

    setLoaded(true);
  }, []);

  const domainTasks = useMemo(
    () => tasks.filter((task) => task.domain === domain),
    [tasks, domain],
  );

  const approved = domainTasks.filter((task) => task.status === "Approved").length;

  const submitted = domainTasks.filter((task) => task.status === "Submitted").length;

  const pending = domainTasks.filter((task) => task.status === "Pending").length;

  const total = domainTasks.length;

  const completion = total > 0 ? Math.round((approved / total) * 100) : 0;

  const submittedAchievements = domainTasks.filter((task) => task.status !== "Pending").length;

  if (!loaded) {
    return (
      <AppShell role="member">
        <div className="p-8 text-sm text-muted-foreground">Loading your progress...</div>
      </AppShell>
    );
  }

  if (!domain) {
    return (
      <AppShell role="member">
        <PageHeader
          title="Your Progress"
          description="Track your learning journey and achievements."
        />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <h2 className="text-xl font-semibold">Choose your learning domain first</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Your progress will be calculated from tasks in your selected learning domain.
            </p>
            <Button onClick={() => (window.location.href = "/tracks")}>
              Explore Learning Domains
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell role="member">
      <div className="space-y-6">
        <PageHeader
          title="Your Progress"
          description="Monitor your achievements and growth in your selected learning domain."
        />

        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Active learning domain</p>
                <h2 className="mt-1 text-xl font-semibold">{domain}</h2>
              </div>
              <Button variant="outline" onClick={() => (window.location.href = "/tracks")}>
                Change domain
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">Overall completion</span>
                <span className="text-sm font-semibold">{completion}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {approved} of {total} tasks approved
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Total tasks</p>
              <p className="mt-2 text-3xl font-bold">{total}</p>
              <p className="mt-1 text-xs text-muted-foreground">In your selected domain</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="mt-2 text-3xl font-bold">{approved}</p>
              <Badge variant="ok">Completed</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Submitted</p>
              <p className="mt-2 text-3xl font-bold">{submitted}</p>
              <Badge variant="wait">Awaiting review</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="mt-2 text-3xl font-bold">{pending}</p>
              <Badge variant="attn">Not submitted</Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="space-y-4 p-6">
            <div>
              <h2 className="text-lg font-semibold">Learning milestones</h2>
              <p className="text-sm text-muted-foreground">
                Achievements based on your task activity.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {achievements.map((achievement) => {
                const achieved =
                  achievement.title === "First Submission"
                    ? submittedAchievements >= 1
                    : achievement.title === "First Approval"
                      ? approved >= 1
                      : approved >= achievement.requirement;

                return (
                  <div
                    key={achievement.title}
                    className="flex items-start justify-between gap-3 rounded-lg border p-4"
                  >
                    <div>
                      <h3 className="font-medium">{achievement.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                    <Badge variant={achieved ? "ok" : "wait"}>
                      {achieved ? "Achieved" : "Locked"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <div>
              <h2 className="text-lg font-semibold">Task progress</h2>
              <p className="text-sm text-muted-foreground">Your learning activity in {domain}.</p>
            </div>

            {domainTasks.length === 0 ? (
              <p className="rounded-lg border p-5 text-sm text-muted-foreground">
                No tasks are available yet. Check your Work page for updates.
              </p>
            ) : (
              <div className="space-y-3">
                {domainTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
                  >
                    <div>
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Deadline: {task.deadline}
                      </p>
                    </div>
                    <Badge
                      variant={
                        task.status === "Approved"
                          ? "ok"
                          : task.status === "Submitted"
                            ? "wait"
                            : "attn"
                      }
                    >
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            <Button variant="outline" onClick={() => (window.location.href = "/work")}>
              Go to Work
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
