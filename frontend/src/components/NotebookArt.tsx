// Drawn inline rather than shipped as an image so it inherits the theme
// colours and switches with the dark scheme for free.
export function NotebookArt({ className = '' }: { className?: string }) {
  const rings = [0, 1, 2, 3, 4, 5, 6];
  const ruleLines = [0, 1, 2, 3, 4, 5];
  const written = [
    { d: 'M78 176 q16 -9 32 0 t32 0 t32 0', delay: 500 },
    { d: 'M78 212 q16 -9 32 0 t32 0 t20 -2', delay: 900 },
    { d: 'M78 248 q16 -9 32 0 t24 -1', delay: 1300 },
  ];

  return (
    <svg
      viewBox="0 0 420 400"
      role="img"
      aria-label="An open notebook with a pencil and sticky notes"
      className={`w-full ${className}`}
    >
      {/* sticky notes, drifting at different rates so they never look paired */}
      <g className="animate-float origin-center" style={{ animationDelay: '0ms' }}>
        <rect
          x="24"
          y="54"
          width="88"
          height="88"
          rx="3"
          transform="rotate(-8 68 98)"
          className="fill-accent/25 stroke-accent/30"
        />
        <path
          d="M42 88 h50 M42 104 h50 M42 120 h32"
          transform="rotate(-8 68 98)"
          className="stroke-accent/45"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      <g className="animate-float origin-center" style={{ animationDelay: '1800ms' }}>
        <rect
          x="316"
          y="40"
          width="74"
          height="74"
          rx="3"
          transform="rotate(7 353 77)"
          className="fill-rule/60 stroke-edge"
        />
        <path
          d="M332 66 h42 M332 80 h42 M332 94 h26"
          transform="rotate(7 353 77)"
          className="stroke-ink-faint/70"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      {/* a coffee ring, because the desk has seen some use */}
      <circle
        cx="352"
        cy="338"
        r="28"
        fill="none"
        className="stroke-accent/20"
        strokeWidth="5"
      />

      {/* the notebook */}
      <ellipse cx="210" cy="332" rx="152" ry="13" className="fill-ink/10" />
      <rect x="52" y="110" width="316" height="216" rx="9" className="fill-accent/20" />
      <rect x="58" y="116" width="150" height="202" rx="4" className="fill-sheet stroke-edge" />
      <rect x="212" y="116" width="150" height="202" rx="4" className="fill-sheet stroke-edge" />

      {/* ruled lines and the margin rule on the right page */}
      <path
        d={ruleLines.map((i) => `M226 ${152 + i * 28} h124`).join(' ')}
        className="stroke-rule"
        strokeWidth="2"
      />
      <path d="M238 122 v190" className="stroke-margin-line/70" strokeWidth="2" />

      {/* handwriting that draws itself on, one line after the next */}
      {written.map((line) => (
        <path
          key={line.d}
          d={line.d}
          fill="none"
          className="animate-draw stroke-ink-soft/70"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="200"
          strokeDashoffset="200"
          style={{ animationDelay: `${line.delay}ms` }}
        />
      ))}

      {/* spiral binding */}
      {rings.map((i) => (
        <ellipse
          key={i}
          cx="210"
          cy={138 + i * 28}
          rx="10"
          ry="5.5"
          fill="none"
          className="stroke-ink-faint"
          strokeWidth="2.5"
        />
      ))}

      {/* pencil resting across the corner */}
      <g transform="rotate(-19 300 330)" className="animate-sway origin-center">
        <rect x="238" y="324" width="104" height="13" rx="2" className="fill-accent" />
        <rect x="342" y="324" width="14" height="13" rx="2" className="fill-ink-faint" />
        <rect x="356" y="325" width="10" height="11" rx="2" className="fill-margin-line" />
        <path d="M238 324 l-20 6.5 l20 6.5 z" className="fill-paper stroke-ink-faint" strokeWidth="1.5" />
        <path d="M224 328.5 l-6 2 l6 2 z" className="fill-ink" />
      </g>

      {/* paperclip on the top edge */}
      <path
        d="M96 108 v-24 a9 9 0 0 1 18 0 v30 a15 15 0 0 1 -30 0 v-26"
        fill="none"
        className="stroke-ink-faint"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
