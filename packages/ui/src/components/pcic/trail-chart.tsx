import { cn } from "../../lib/utils";

interface TrailChartProps {
  milestones: string[];
  completedCount: number;
  doneInCurrent: number;
  totalInCurrent: number;
  showStart: boolean;
  className?: string;
}

const V = [
  [20, 200],
  [120, 150],
  [190, 200],
  [270, 130],
  [350, 200],
  [430, 110],
  [510, 200],
  [600, 80],
  [680, 200],
] as const;

const X = [120, 270, 430, 600];

function TrailChart({
  milestones,
  completedCount,
  doneInCurrent,
  totalInCurrent,
  showStart,
  className,
}: TrailChartProps) {
  // Safe accessors: provide a fallback if an index is unavailable.
  const pointAt = (index: number): readonly [number, number] => V[index] ?? [20, 200];

  const cumulative = [0];

  for (let index = 1; index < V.length; index += 1) {
    const previous = pointAt(index - 1);
    const current = pointAt(index);

    cumulative.push(
      (cumulative[index - 1] ?? 0) + Math.hypot(current[0] - previous[0], current[1] - previous[1]),
    );
  }

  const cumulativeAt = (index: number): number => cumulative[index] ?? 0;

  const m = Math.max(0, Math.min(completedCount, X.length));
  const a = Math.max(2 * m - 1, 0);
  const b = Math.min(2 * m + 1, cumulative.length - 1);

  const currentTotal = Math.max(totalInCurrent, 0);
  const currentDone = currentTotal === 0 ? 0 : Math.max(0, Math.min(doneInCurrent, currentTotal));

  const fill =
    cumulativeAt(a) +
    (cumulativeAt(b) - cumulativeAt(a)) * (currentTotal === 0 ? 0 : currentDone / currentTotal);

  let segment = 1;

  while (segment < V.length - 1 && cumulativeAt(segment) < fill) {
    segment += 1;
  }

  const segmentLength = cumulativeAt(segment) - cumulativeAt(segment - 1);

  const fraction = segmentLength === 0 ? 0 : (fill - cumulativeAt(segment - 1)) / segmentLength;

  const previousPoint = pointAt(segment - 1);
  const currentPoint = pointAt(segment);

  const px = previousPoint[0] + (currentPoint[0] - previousPoint[0]) * fraction;

  const py = previousPoint[1] + (currentPoint[1] - previousPoint[1]) * fraction;

  const path = `M${V.map((vertex) => vertex.join(" ")).join(" L")}`;

  const status = (index: number) =>
    index < m ? "Complete" : index === m ? "In progress" : "Upcoming";

  return (
    <svg
      role="img"
      aria-label="Learning milestone trail"
      viewBox="0 0 700 270"
      overflow="visible"
      className={cn("h-auto w-full overflow-visible", className)}
    >
      <path
        d={path}
        fill="none"
        stroke="var(--line)"
        strokeWidth="8"
        strokeLinejoin="miter"
        strokeLinecap="round"
      />

      <path
        d={path}
        fill="none"
        stroke="var(--org)"
        strokeWidth="8"
        strokeLinejoin="miter"
        strokeLinecap="round"
        strokeDasharray={`${fill} 9999`}
      />

      {X.map((x, index) => {
        const y = pointAt(2 * index + 1)[1];
        const active = index === m && m < milestones.length;
        const milestone = milestones[index] ?? `Milestone ${index + 1}`;
        const label = milestone.length > 18 ? `${milestone.slice(0, 17)}…` : milestone;

        return (
          <g key={`${x}-${milestones[index] ?? index}`}>
            {active && <circle className="pulse" cx={x} cy={y} r="14" fill="var(--org)" />}

            <circle
              cx={x}
              cy={y}
              r="15"
              fill={index < m ? "var(--btn)" : active ? "var(--org)" : "var(--card)"}
              stroke={index < m ? "var(--btn)" : "var(--ink)"}
              strokeWidth="3"
              strokeDasharray={index > m ? "4 4" : undefined}
            />

            {index < m && (
              <path
                d={`M${x - 6} ${y} l4 5 l8 -10`}
                stroke="var(--btni)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            )}

            <text className="trail-label" x={x} y="232" textAnchor="middle" fill="var(--ink)">
              {label}
            </text>

            <text className="trail-status" x={x} y="251" textAnchor="middle" fill="var(--mute)">
              M{index + 1} · {status(index)}
            </text>
          </g>
        );
      })}

      {showStart && currentDone === 0 && (
        <text className="trail-status" x="20" y="232" textAnchor="start" fill="var(--mute)">
          START
        </text>
      )}

      <g transform={`translate(${px},${py - 24})`}>
        <path d="M0 20 C-14 3 -14 -9 0 -9 C14 -9 14 3 0 20Z" fill="var(--ink)" />
        <text
          x="0"
          y="5"
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          fill="var(--card)"
          fontFamily="var(--mo)"
        >
          YOU
        </text>
      </g>
    </svg>
  );
}

export { TrailChart };
