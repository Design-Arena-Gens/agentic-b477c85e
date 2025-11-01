import { ChartSnapshot } from "@/lib/yahoo";

const HEIGHT = 240;
const WIDTH = 760;
const PADDING = { top: 24, right: 20, bottom: 40, left: 60 };

function formatDateLabel(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric"
  });
}

function formatPrice(value: number): string {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

type Props = {
  chart: ChartSnapshot;
};

export function PriceChart({ chart }: Props) {
  if (chart.points.length < 2) {
    return <p>Not enough data to render the chart.</p>;
  }

  const closes = chart.points.map((p) => p.close);
  const timestamps = chart.points.map((p) => p.timestamp);
  const minClose = Math.min(...closes);
  const maxClose = Math.max(...closes);

  const yRange = maxClose - minClose || 1;
  const usableWidth = WIDTH - PADDING.left - PADDING.right;
  const usableHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const points = chart.points.map((point, idx) => {
    const x = PADDING.left + (idx / (chart.points.length - 1)) * usableWidth;
    const y =
      PADDING.top + usableHeight - ((point.close - minClose) / yRange) * usableHeight;
    return { x, y };
  });

  const linePath = points
    .map((point, idx) => `${idx === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");

  const first = timestamps[0];
  const mid = timestamps[Math.floor(timestamps.length / 2)];
  const last = timestamps.at(-1)!;

  const yLabels = [
    { label: maxClose, y: PADDING.top + 12 },
    { label: minClose + yRange / 2, y: PADDING.top + usableHeight / 2 + 6 },
    { label: minClose, y: PADDING.top + usableHeight + 12 }
  ];

  return (
    <svg
      className="price-chart"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="Price chart"
    >
      <defs>
        <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
        </linearGradient>
        <mask id="priceMask">
          <path
            d={`${linePath} L${PADDING.left + usableWidth} ${HEIGHT - PADDING.bottom} L${PADDING.left} ${HEIGHT - PADDING.bottom} Z`}
            fill="white"
            stroke="white"
            strokeWidth="0"
          />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="#ffffff" rx="16" ry="16" />
      <rect
        x={PADDING.left}
        y={PADDING.top}
        width={usableWidth}
        height={usableHeight}
        fill="url(#priceGradient)"
        mask="url(#priceMask)"
      />
      <path d={linePath} className="price-line" stroke="#4338ca" />

      {points.map((point, idx) => (
        <circle
          key={idx}
          cx={point.x}
          cy={point.y}
          r={idx === points.length - 1 ? 4 : 2}
          fill={idx === points.length - 1 ? "#4338ca" : "#6366f1"}
          opacity={idx === points.length - 1 ? 1 : 0.4}
        />
      ))}

      {yLabels.map((item, idx) => (
        <text key={idx} x={12} y={item.y} className="chart-axis">
          ₹{formatPrice(item.label)}
        </text>
      ))}

      <text x={PADDING.left} y={HEIGHT - PADDING.bottom + 24} className="chart-axis">
        {formatDateLabel(first)}
      </text>
      <text
        x={PADDING.left + usableWidth / 2}
        y={HEIGHT - PADDING.bottom + 24}
        className="chart-axis"
        textAnchor="middle"
      >
        {formatDateLabel(mid)}
      </text>
      <text
        x={PADDING.left + usableWidth}
        y={HEIGHT - PADDING.bottom + 24}
        className="chart-axis"
        textAnchor="end"
      >
        {formatDateLabel(last)}
      </text>
    </svg>
  );
}
