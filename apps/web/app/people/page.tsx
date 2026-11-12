"use client";

import { useState } from "react";
import { AppShell, PageHeader, Card, CardContent, Button, Badge } from "@pcic/ui";

const leaderboard = [
  { rank: 1, name: "Learner 01", domain: "Code Crafters", points: 1250, approved: 12 },
  { rank: 2, name: "Learner 02", domain: "Data Science", points: 1100, approved: 10 },
  { rank: 3, name: "Learner 03", domain: "Cyber Security", points: 980, approved: 9 },
  { rank: 4, name: "Learner 04", domain: "Code Crafters", points: 850, approved: 8 },
  { rank: 5, name: "Learner 05", domain: "Data Science", points: 760, approved: 7 },
  { rank: 6, name: "Learner 06", domain: "Cyber Security", points: 690, approved: 6 },
];

const announcements = [
  {
    category: "Community update",
    date: "November 10, 2026",
    title: "Welcome to the PCIC learning community",
    description:
      "Connect with fellow learners, share your progress, exchange ideas, and support one another throughout your learning journey.",
  },
  {
    category: "Learning opportunity",
    date: "November 11, 2026",
    title: "Share what you are building",
    description:
      "Use the community to discuss your projects, share useful resources, and learn from the experiences of other students.",
  },
];

const activities = [
  {
    title: "Project Showcase",
    type: "Community activity",
    description:
      "Present your work, explain the problem you are solving, and receive constructive feedback from fellow learners.",
    date: "Coming soon",
  },
  {
    title: "Peer Learning Session",
    type: "Learning activity",
    description:
      "Collaborate with other students, exchange knowledge, and work through challenging concepts together.",
    date: "Coming soon",
  },
  {
    title: "Knowledge Sharing",
    type: "Community activity",
    description:
      "Share tutorials, useful tools, learning resources, and insights related to your domain.",
    date: "Ongoing",
  },
];

const discussions = [
  {
    title: "What are you currently learning?",
    description:
      "Share the topic or concept you are working on and what you have discovered so far.",
    category: "Learning",
  },
  {
    title: "What problem are you solving with your project?",
    description:
      "Talk about your project idea, the problem behind it, and the solution you are developing.",
    category: "Projects",
  },
  {
    title: "Share a resource that helped you",
    description:
      "Recommend a tutorial, article, documentation page, or tool that helped you understand something.",
    category: "Resources",
  },
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("All");

  const filteredDiscussions =
    activeTab === "All" ? discussions : discussions.filter((item) => item.category === activeTab);

  return (
    <AppShell role="member">
      <div className="space-y-6">
        <PageHeader
          title="Community"
          description="Connect, collaborate, share knowledge, and grow together with the PCIC learning community."
        />

        {/* Community Welcome */}
        <Card>
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl space-y-2">
              <Badge variant="ok">PCIC Learning Community</Badge>
              <h2 className="text-xl font-semibold">Learning is better when we grow together.</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Connect with fellow learners, exchange ideas, showcase your projects, and contribute
                to a supportive learning environment.
              </p>
            </div>
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-muted text-3xl font-bold">
              PCIC
            </div>
          </CardContent>
        </Card>

        {/* Community Leaderboard */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">Community Leaderboard</h2>
              <p className="text-sm text-muted-foreground">
                Recognizing learners for their progress and achievements.
              </p>
            </div>
            <Badge variant="info">Demo rankings</Badge>
          </div>

          <Card>
            <CardContent className="space-y-5 p-5">
              {/* Top Three Learners */}
              <div className="grid gap-3 sm:grid-cols-3">
                {leaderboard.slice(0, 3).map((learner) => (
                  <div
                    key={learner.rank}
                    className={`rounded-xl border p-4 ${
                      learner.rank === 1 ? "border-primary/40 bg-primary/5" : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {learner.rank === 1 ? "TOP PERFORMER" : `TOP ${learner.rank}`}
                      </span>
                      {learner.rank === 1 && <Badge variant="ok">Leader</Badge>}
                    </div>

                    <h3 className="mt-4 text-lg font-semibold">{learner.name}</h3>

                    <p className="mt-1 text-xs text-muted-foreground">{learner.domain}</p>

                    <p className="mt-4 text-2xl font-bold tabular-nums">
                      {learner.points.toLocaleString()}
                    </p>

                    <p className="text-xs text-muted-foreground">Total XP</p>
                  </div>
                ))}
              </div>

              {/* Three-column leaderboard */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">Learner rankings</h3>
                  <span className="text-xs text-muted-foreground">Ordered by total XP</span>
                </div>

                <div className="hidden grid-cols-[1fr_130px_110px] gap-3 border-b px-3 py-2 text-xs font-medium text-muted-foreground sm:grid">
                  <span>Learner</span>
                  <span>Domain</span>
                  <span className="text-right">XP</span>
                </div>

                {leaderboard.map((learner) => (
                  <div
                    key={learner.rank}
                    className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_130px_110px]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{learner.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {learner.approved} approved tasks
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground sm:hidden">
                        {learner.domain}
                      </p>
                    </div>

                    <span className="hidden text-xs text-muted-foreground sm:block">
                      {learner.domain}
                    </span>

                    <span className="text-right text-sm font-semibold tabular-nums">
                      {learner.points.toLocaleString()} XP
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-xs leading-5 text-muted-foreground">
                Rankings are illustrative demo data. Official rankings should be calculated from
                verified student activity and approved submissions.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Announcements */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Announcements</h2>
            <p className="text-sm text-muted-foreground">
              Important updates and messages for the community.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {announcements.map((item) => (
              <Card key={item.title}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="info">{item.category}</Badge>
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Community Activities */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Community activities</h2>
            <p className="text-sm text-muted-foreground">
              Opportunities to participate and learn with others.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activities.map((activity) => (
              <Card key={activity.title}>
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <Badge variant="secondary">{activity.type}</Badge>
                  <h3 className="font-semibold">{activity.title}</h3>
                  <p className="flex-1 text-sm leading-6 text-muted-foreground">
                    {activity.description}
                  </p>
                  <div className="border-t pt-3 text-xs text-muted-foreground">{activity.date}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Discussion Space */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Discussion space</h2>
            <p className="text-sm text-muted-foreground">
              Explore topics and conversation starters for the community.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {["All", "Learning", "Projects", "Resources"].map((tab) => (
              <Button
                key={tab}
                size="sm"
                variant={activeTab === tab ? "default" : "outline"}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </Button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredDiscussions.map((discussion) => (
              <Card key={discussion.title}>
                <CardContent className="flex flex-wrap items-start justify-between gap-3 p-5">
                  <div className="max-w-2xl space-y-2">
                    <h3 className="font-semibold">{discussion.title}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {discussion.description}
                    </p>
                  </div>
                  <Badge variant="secondary">{discussion.category}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Community Guidelines */}
        <Card>
          <CardContent className="space-y-3 p-5">
            <h2 className="font-semibold">Be an active community member</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Support your peers, ask thoughtful questions, share what you learn, and contribute
              positively to the PCIC community.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
