import type { PracticeGraph } from "@/data/tickets";

type Props = {
  graph: PracticeGraph;
};

const WIDTH = 900;
const HEIGHT = 410;
const MARGIN = { top: 38, right: 34, bottom: 104, left: 82 };

function formatTick(value: number, graph: PracticeGraph): string {
  if (graph.tickFormat === "fraction") {
    if (value === 0) return "0";
    if (value === 1) return "1";
    return value.toFixed(2).replace(".", ",");
  }

  if (Math.abs(value) >= 1000) return value.toLocaleString("ru-RU");
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(".", ",");
}

function calculateTicks(max: number, count = 4): number[] {
  return Array.from({ length: count + 1 }, (_, index) => (max * index) / count);
}

export default function PracticeChart({ graph }: Props) {
  const chartWidth = WIDTH - MARGIN.left - MARGIN.right;
  const chartHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const values = graph.values;
  const maxValue = graph.yMax ?? Math.max(1, ...values);
  const minValue = graph.yMin ?? 0;
  const valueRange = Math.max(1e-9, maxValue - minValue);
  const ticks = graph.yTicks ?? calculateTicks(maxValue, 4);
  const xCount = Math.max(1, graph.values.length - 1);
  const pointXValues = graph.xValues;
  const xMin = pointXValues ? Math.min(...pointXValues) : 0;
  const xMax = pointXValues ? Math.max(...pointXValues) : xCount;
  const xRange = Math.max(1e-9, xMax - xMin);

  const y = (value: number) => MARGIN.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;
  const x = (index: number) => {
    if (graph.kind === "histogram") return MARGIN.left + (chartWidth / graph.labels.length) * index;
    if (pointXValues) return MARGIN.left + ((pointXValues[index] - xMin) / xRange) * chartWidth;
    return MARGIN.left + (chartWidth / xCount) * index;
  };

  const polylinePoints = values.map((value, index) => `${x(index)},${y(value)}`).join(" ");

  const stepPath = values.reduce((path, value, index) => {
    if (index === 0) return `M ${x(0)} ${y(value)}`;
    return `${path} L ${x(index)} ${y(values[index - 1])} L ${x(index)} ${y(value)}`;
  }, "");

  const piecewisePath = values.reduce((path, value, index) => {
    if (index === 0) return `M ${x(index)} ${y(value)}`;
    return `${path} L ${x(index)} ${y(value)}`;
  }, "");

  const svgTitle = graph.title;

  return (
    <figure className="practice-chart" aria-label={svgTitle}>
      <div className="chart-heading">
        <strong>{graph.title}</strong>
        {graph.subtitle && <span>{graph.subtitle}</span>}
      </div>

      <div className="chart-scroll">
      <svg className="chart-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={svgTitle}>
        <title>{svgTitle}</title>
        <defs>
          <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffbd56" stopOpacity="0.58" />
            <stop offset="100%" stopColor="#ff9f0a" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={MARGIN.left} y1={y(tick)} x2={WIDTH - MARGIN.right} y2={y(tick)} className="chart-grid-line" />
            <text x={MARGIN.left - 12} y={y(tick) + 4} className="chart-axis-text" textAnchor="end">
              {formatTick(tick, graph)}
            </text>
          </g>
        ))}

        <line x1={MARGIN.left} y1={MARGIN.top} x2={MARGIN.left} y2={HEIGHT - MARGIN.bottom} className="chart-axis-line" />
        <line x1={MARGIN.left} y1={HEIGHT - MARGIN.bottom} x2={WIDTH - MARGIN.right} y2={HEIGHT - MARGIN.bottom} className="chart-axis-line" />

        {graph.kind === "histogram" && graph.values.map((value, index) => {
          const barWidth = chartWidth / graph.labels.length;
          const barX = MARGIN.left + barWidth * index;
          const barY = y(value);
          const height = HEIGHT - MARGIN.bottom - barY;
          return (
            <rect
              key={`${graph.labels[index]}-${value}`}
              x={barX + 1}
              y={barY}
              width={Math.max(2, barWidth - 2)}
              height={Math.max(0, height)}
              rx="2"
              className="chart-bar"
            />
          );
        })}

        {graph.kind === "line" && (
          <>
            <polyline points={polylinePoints} className="chart-line" fill="none" />
            {values.map((value, index) => <circle key={`${index}-${value}`} cx={x(index)} cy={y(value)} r="4.4" className="chart-point" />)}
          </>
        )}

        {graph.kind === "step" && (
          <>
            <path d={stepPath} className="chart-step" fill="none" />
            {values.map((value, index) => <circle key={`${index}-${value}`} cx={x(index)} cy={y(value)} r="4" className="chart-point" />)}
          </>
        )}

        {graph.kind === "piecewise" && (
          <>
            {graph.area && (
              <path
                d={`${piecewisePath} L ${x(values.length - 1)} ${y(0)} L ${x(0)} ${y(0)} Z`}
                fill="url(#chartFill)"
              />
            )}
            <path d={piecewisePath} className="chart-piecewise" fill="none" />
          </>
        )}

        {(graph.axisTicks
          ? graph.axisTicks.map((tick) => ({ label: tick.label, x: MARGIN.left + ((tick.value - xMin) / xRange) * chartWidth }))
          : graph.labels.map((label, index) => ({
              label,
              x: graph.kind === "histogram"
                ? MARGIN.left + (chartWidth / graph.labels.length) * index + (chartWidth / graph.labels.length) / 2
                : x(index),
            })))
          .map((tick, index) => (
            <text
              key={`${tick.label}-${index}`}
              x={tick.x}
              y={HEIGHT - MARGIN.bottom + 23}
              className="chart-axis-text chart-x-label"
              textAnchor="middle"
            >
              {tick.label}
            </text>
          ))}

        {graph.xLabel && <text x={MARGIN.left + chartWidth / 2} y={HEIGHT - 13} className="chart-axis-title" textAnchor="middle">{graph.xLabel}</text>}
        {graph.yLabel && <text x="16" y={MARGIN.top + chartHeight / 2} className="chart-axis-title" textAnchor="middle" transform={`rotate(-90 16 ${MARGIN.top + chartHeight / 2})`}>{graph.yLabel}</text>}
      </svg>
      </div>

      {graph.caption && <figcaption>{graph.caption}</figcaption>}
    </figure>
  );
}
