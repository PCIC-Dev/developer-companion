"use client";

import { useState } from "react";
import {
  AppShell,
  Badge,
  BadgeItem,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Hero,
  KeyValue,
  ListRow,
  Meta,
  PageHeader,
  Progress,
  QueueItem,
  TrailChart,
} from "@pcic/ui";

export default function HomePage() {
  const [completed, setCompleted] = useState(false);
  const [selectedTask, setSelectedTask] = useState("task-2");

  return (
    <AppShell name="Student" role="member" pathname="/">
      <PageHeader
        eyebrow="Student dashboard"
        title="Your learning journey"
        description="Keep learning, building, and making progress."
        actions={
          <Button variant="alt" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        }
      />

      <Hero
        eyebrow="Your journey"
        title={
          <>
            Welcome back, <em>Student.</em>
          </>
        }
        description="Your next step is ready. Keep building your skills one task at a time."
        stats={[
          { value: "2/4", label: "Tasks approved" },
          { value: "7 days", label: "Next deadline" },
          { value: "3", label: "New updates" },
        ]}
      />

      <div className="grid gap-6 min-[1000px]:grid-cols-[1.7fr_1fr]">
        <div className="grid content-start gap-6">
          <Card className="border-2 border-primary">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="attn">Next task</Badge>
                <Meta>Due in 7 days</Meta>
              </div>
              <CardTitle>Build a responsive web interface</CardTitle>
              <Meta>Code Crafters · Task 3 of 4</Meta>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create a responsive interface using the project requirements and demonstrate your
                understanding of frontend development.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={() => setSelectedTask("task-3")}>
                  {selectedTask === "task-3" ? "Task selected" : "Start this task"}
                </Button>
                <Button variant="alt" onClick={() => setSelectedTask("task-2")}>
                  View previous task
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Your learning trail</CardTitle>
                  <Meta>Code Crafters · 50% complete</Meta>
                </div>
                <Badge variant="wait">In progress</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <TrailChart
                milestones={["Research", "Design", "Build", "Launch"]}
                completedCount={1}
                doneInCurrent={2}
                totalInCurrent={4}
                showStart={false}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upcoming deadlines</CardTitle>
                <a href="/demo" className="text-sm font-semibold text-primary">
                  View components
                </a>
              </div>
            </CardHeader>
            <CardContent>
              <ListRow>
                <div className="min-w-0 flex-1">
                  <b>Responsive web interface</b>
                  <Meta>Code Crafters</Meta>
                </div>
                <Badge variant="attn">7 days</Badge>
              </ListRow>
              <ListRow>
                <div className="min-w-0 flex-1">
                  <b>Project documentation</b>
                  <Meta>Code Crafters</Meta>
                </div>
                <Badge variant="wait">14 days</Badge>
              </ListRow>
            </CardContent>
          </Card>
        </div>

        <div className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle>My task checklist</CardTitle>
              <Meta>Track your current work</Meta>
            </CardHeader>
            <CardContent className="grid gap-3">
              <QueueItem selected={completed} onClick={() => setCompleted(!completed)}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">Read the project brief</span>
                  <Badge variant={completed ? "ok" : "wait"}>{completed ? "Done" : "To do"}</Badge>
                </div>
                <Meta>Understand the requirements · 15 min</Meta>
              </QueueItem>
              <QueueItem
                selected={selectedTask === "task-2"}
                onClick={() => setSelectedTask("task-2")}
              >
                <span className="font-semibold">Create wireframes</span>
                <Meta>Plan the interface · 30 min</Meta>
              </QueueItem>
              <QueueItem
                selected={selectedTask === "task-3"}
                onClick={() => setSelectedTask("task-3")}
              >
                <span className="font-semibold">Build the interface</span>
                <Meta>Develop the responsive UI</Meta>
              </QueueItem>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <KeyValue
                items={[
                  { label: "Learning track", value: "Code Crafters" },
                  { label: "Level", value: "Beginner" },
                  { label: "Approved tasks", value: "2 of 4" },
                  { label: "XP earned", value: "240 XP" },
                ]}
              />
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Overall progress</span>
                  <b>50%</b>
                </div>
                <Progress value={50} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <ListRow>
                <div>
                  <b>Weekly community update</b>
                  <Meta>New learning opportunities</Meta>
                </div>
                <Badge variant="attn">New</Badge>
              </ListRow>
              <ListRow>
                <div>
                  <b>Mentor office hours</b>
                  <Meta>Session schedule available</Meta>
                </div>
              </ListRow>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <BadgeItem title="Joined a learning track" earned />
              <BadgeItem title="First task started" earned />
              <BadgeItem title="First submission" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mentorship</CardTitle>
              <Meta>Get guidance when you need it.</Meta>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Connect with a mentor for feedback, direction, and support.
              </p>
              <Button
                className="mt-4"
                variant="alt"
                onClick={() => (window.location.href = "/demo")}
              >
                Explore the component demo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
