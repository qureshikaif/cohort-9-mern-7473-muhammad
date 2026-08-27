interface Day {
  label: string;
  full: string;
  count: number;
}

export function ActivityChart({ days }: { days: Day[] }) {
  const peak = Math.max(...days.map((day) => day.count), 1);
  const barWidth = 18;
  const gap = 14;
  const height = 96;
  const width = days.length * (barWidth + gap) - gap;

  return (
    <figure className="m-0">
      <figcaption className="mb-4 text-xs tracking-wider text-ink-soft uppercase">
        Notes edited, last 7 days
      </figcaption>

      <svg
        viewBox={`0 0 ${width} ${height + 18}`}
        className="w-full"
        role="img"
        aria-label="Notes edited per day"
      >
        <line
          x1="0"
          y1={height}
          x2={width}
          y2={height}
          className="stroke-edge"
          strokeWidth="1"
        />

        {days.map((day, index) => {
          const barHeight = day.count === 0 ? 2 : Math.round((day.count / peak) * (height - 12));
          const x = index * (barWidth + gap);

          return (
            <g key={day.full}>
              <title>{`${day.full}: ${day.count}`}</title>
              <rect
                x={x}
                y={height - barHeight}
                width={barWidth}
                height={barHeight}
                rx="4"
                className={day.count === 0 ? 'fill-ink/15' : 'fill-accent'}
              />
              <text
                x={x + barWidth / 2}
                y={height + 14}
                textAnchor="middle"
                className="fill-ink-faint text-[9px]"
              >
                {day.label}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
