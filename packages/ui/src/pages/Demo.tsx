"use client";
import { useState } from "react";
import { AppShell } from "../components/pcic/app-shell";
import { BadgeItem } from "../components/pcic/badge-item";
import { Hero } from "../components/pcic/hero";
import { KeyValue } from "../components/pcic/key-value";
import { ListRow } from "../components/pcic/list-row";
import { PageHeader } from "../components/pcic/page-header";
import { QueueItem } from "../components/pcic/queue-item";
import { StreakSquares } from "../components/pcic/streak-squares";
import { TrailChart } from "../components/pcic/trail-chart";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { FieldError } from "../components/ui/field-error";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { ResourceCheckRow } from "../components/ui/resource-check-row";
import { ScorePicker } from "../components/ui/score-picker";
import { SegmentBar } from "../components/ui/segment-bar";
import { SegmentedControl, SegmentedControlItem } from "../components/ui/toggle-group";
import { Textarea } from "../components/ui/textarea";
import { Eyebrow, Meta, Tag } from "../components/ui/tag";
import { toast, Toaster } from "../components/ui/sonner";

function Demo() {
  const [score, setScore] = useState(3);
  const [checked, setChecked] = useState(false);
  const [segment, setSegment] = useState("all");
  return (
    <>
      <Toaster />
      <AppShell name="Mimi Demo" role="member" pathname="/">
        <PageHeader
          eyebrow="Component library"
          title="PCIC design system"
          description="A presentational demo of the reusable primitives and composites built from the HTML visual specification."
          actions={<Button onClick={() => toast("Saved to your trail.")}>Show toast</Button>}
        />
        <Hero
          eyebrow="Your journey"
          title={
            <>
              Keep building, <em className="text-primary">one step at a time.</em>
            </>
          }
          description="A real project, clear feedback, and visible progress."
          stats={[
            { value: "3", label: "Milestones" },
            { value: "68%", label: "Progress" },
            { value: "+240", label: "XP earned" },
          ]}
        />
        <div className="grid gap-6 min-[1000px]:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Primitives</CardTitle>
              <Meta>Buttons, labels, fields, badges, and status controls.</Meta>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="flex flex-wrap gap-3">
                <Button>Default</Button>
                <Button variant="alt">Alt</Button>
                <Button variant="ghost">Ghost</Button>
                <Button size="sm">Small</Button>
                <Button disabled>Disabled</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="ok">Approved</Badge>
                <Badge variant="attn">Attention</Badge>
                <Badge variant="wait">Waiting</Badge>
                <Badge variant="mut">Muted</Badge>
                <Tag>Code Crafters</Tag>
              </div>
              <Label htmlFor="demo-input">Project URL</Label>
              <Input
                id="demo-input"
                aria-invalid="true"
                aria-describedby="demo-error"
                placeholder="https://github.com/..."
              />
              <FieldError id="demo-error">Use a full link that starts with https://</FieldError>
              <Label htmlFor="demo-textarea">Feedback</Label>
              <Textarea id="demo-textarea" placeholder="Write specific feedback" />
              <div className="flex items-center gap-3">
                <Checkbox
                  id="demo-check"
                  checked={checked}
                  onCheckedChange={(value) => setChecked(Boolean(value))}
                />
                <Label className="mt-0" htmlFor="demo-check">
                  I have read the rubric
                </Label>
              </div>
            </CardContent>
            <CardFooter>
              <Progress value={68} className="w-full" />
            </CardFooter>
          </Card>
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle as="h3">Controls and progress</CardTitle>
              <Meta>Inputs keep the HTML touch targets and status semantics.</Meta>
            </CardHeader>
            <CardContent className="grid gap-5">
              <SegmentedControl
                value={segment}
                onValueChange={(value) => value && setSegment(value)}
              >
                <SegmentedControlItem value="all">All</SegmentedControlItem>
                <SegmentedControlItem value="mine">Mine</SegmentedControlItem>
                <SegmentedControlItem value="done">Done</SegmentedControlItem>
              </SegmentedControl>
              <SegmentBar count={4} filled={2} />
              <SegmentBar count={4} filled={3} complete />
              <ScorePicker value={score} onValueChange={setScore} />
              <ResourceCheckRow
                title="Read the project brief"
                subtitle="Read Â· 15 min"
                xp={10}
                checked={checked}
                onCheckedChange={setChecked}
              />
              <StreakSquares
                items={[
                  { state: "done", label: "OCT 6" },
                  { state: "done", label: "GRACE" },
                  { state: "next", label: "OCT 20" },
                  { state: "empty", label: "NOW" },
                  { state: "empty", label: "DAY 1" },
                ]}
              />
            </CardContent>
          </Card>
        </div>
        <div className="mt-6 grid gap-6 min-[1000px]:grid-cols-[1.3fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Trail chart</CardTitle>
              <Meta>Faithful SVG port of the HTML trail renderer.</Meta>
            </CardHeader>
            <CardContent>
              <TrailChart
                milestones={["Brief", "Build", "Review", "Ship"]}
                completedCount={1}
                doneInCurrent={2}
                totalInCurrent={4}
                showStart={false}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Composite rows</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <ListRow highlight>
                <div className="grow">
                  <b>Responsive navigation shell</b>
                  <Meta>Milestone 2 Â· Submitted 3 days ago</Meta>
                </div>
                <Badge variant="wait">Review</Badge>
              </ListRow>
              <QueueItem selected>
                <b>Campus Connect</b>
                <Meta>Waiting 3 days</Meta>
              </QueueItem>
              <KeyValue
                items={[
                  { label: "Level", value: "4" },
                  { label: "XP", value: "680" },
                  { label: "Domain", value: "Code Crafters" },
                ]}
              />
              <BadgeItem title="First submission" earned />
            </CardContent>
          </Card>
        </div>
        <div className="mt-6">
          <Eyebrow>Component library</Eyebrow>
          <Meta className="mt-2">Every component is presentational, typed, and reusable.</Meta>
        </div>
      </AppShell>
    </>
  );
}

export default Demo;
