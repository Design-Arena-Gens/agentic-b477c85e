import { PriceChart } from "@/components/PriceChart";
import { getIntellectSnapshot } from "@/lib/yahoo";

export const dynamic = "force-dynamic";

function formatCurrency(value: number | null): string {
  if (value == null || Number.isNaN(value) || value <= 0) {
    return "–";
  }
  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  });
}

function formatPercent(value: number | null): string {
  if (value == null || Number.isNaN(value)) {
    return "–";
  }
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function abbreviateNumber(value: number | null): string {
  if (!value) {
    return "–";
  }
  const units = [
    { label: "Tn", value: 1_000_000_000_000 },
    { label: "Bn", value: 1_000_000_000 },
    { label: "Cr", value: 10_000_000 },
    { label: "L", value: 100_000 }
  ];

  for (const unit of units) {
    if (value >= unit.value) {
      return `${(value / unit.value).toFixed(2)} ${unit.label}`;
    }
  }

  return value.toLocaleString("en-IN");
}

function formatVolume(value: number | null): string {
  if (!value) {
    return "–";
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)} M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)} K`;
  }
  return value.toLocaleString("en-IN");
}

function formatTimestamp(timestamp: number | null): string {
  if (!timestamp) {
    return "–";
  }
  const date = new Date(timestamp * 1000);
  return date.toLocaleString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour12: true
  });
}

export default async function Page() {
  const { quote, chart, analytics } = await getIntellectSnapshot();

  const hasLiveData = chart.points.length > 0 && quote.price > 0;
  const changeClass = quote.change >= 0 ? "positive" : "negative";
  const deltaSign = quote.change >= 0 ? "+" : "";
  const presentPrice = hasLiveData ? formatCurrency(quote.price) : "–";
  const summaryCards = [
    {
      title: "Market Pulse",
      description: analytics.comment
    },
    quote.fiftyTwoWeekHigh && quote.fiftyTwoWeekLow
      ? {
          title: "Trading Range",
          description: `52-week range spans ${formatCurrency(quote.fiftyTwoWeekLow)} – ${formatCurrency(quote.fiftyTwoWeekHigh)}.`
        }
      : null,
    analytics.momentum30d != null
      ? {
          title: "Momentum",
          description: `30-day momentum: ${
            analytics.momentum30d > 0 ? "+" : ""
          }${analytics.momentum30d.toFixed(1)}%.`
        }
      : null,
    analytics.volatility != null
      ? {
          title: "Risk",
          description: `Realised price volatility over the period: ₹${analytics.volatility.toFixed(2)}.`
        }
      : null
  ].filter((card): card is { title: string; description: string } => Boolean(card));

  return (
    <main>
      <section className="section">
        <span className="badge">Intellect Design Arena Ltd · NSE: INTELLECT</span>
        <h1>Share Price Intelligence Dashboard</h1>
        <p>Live share performance snapshot powered by Yahoo Finance real-time market data.</p>

        <div className="metric-grid" style={{ marginTop: "28px" }}>
          <div className="metric-card">
            <div className="metric-label">Last Traded Price</div>
            <div className="metric-value">{presentPrice}</div>
            <div className={`metric-delta ${changeClass}`}>
              {hasLiveData
                ? `${deltaSign}${quote.change.toFixed(2)} (${formatPercent(quote.changePercent)})`
                : "Live feed unavailable"}
            </div>
            <div style={{ marginTop: "12px", fontSize: "0.8rem", color: "#475467" }}>
              As of {formatTimestamp(quote.timestamp)} ({quote.currency})
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Day Range</div>
            <div className="metric-value" style={{ fontSize: "1.4rem" }}>
              {formatCurrency(quote.dayLow)} – {formatCurrency(quote.dayHigh)}
            </div>
            <div style={{ marginTop: "12px", fontSize: "0.85rem", color: "#475467" }}>
              Prev Close: {formatCurrency(quote.previousClose)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Market Profile</div>
            <div style={{ fontSize: "0.95rem", color: "#1d2939", lineHeight: 1.6 }}>
              <div>Market Cap: {abbreviateNumber(quote.marketCap)}</div>
              <div>Volume: {formatVolume(quote.volume)}</div>
              <div>Avg Vol (3M): {formatVolume(quote.averageVolume)}</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Valuation</div>
            <div style={{ fontSize: "0.95rem", color: "#1d2939", lineHeight: 1.6 }}>
              <div>Trailing P/E: {quote.trailingPE ? quote.trailingPE.toFixed(2) : "–"}</div>
              <div>Forward P/E: {quote.forwardPE ? quote.forwardPE.toFixed(2) : "–"}</div>
              <div>Trend Strength: {analytics.trendStrength}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 style={{ marginTop: 0 }}>Price Performance</h2>
        <div className="chart-container">
          <PriceChart chart={chart} />
        </div>
        {!hasLiveData && (
          <div style={{ marginTop: "16px", color: "#b42318", fontSize: "0.9rem" }}>
            Unable to reach the market data provider right now. Historical series will appear once
            the connection is restored.
          </div>
        )}

        <table className="data-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>52 Week High</td>
              <td>{formatCurrency(quote.fiftyTwoWeekHigh)}</td>
            </tr>
            <tr>
              <td>52 Week Low</td>
              <td>{formatCurrency(quote.fiftyTwoWeekLow)}</td>
            </tr>
            <tr>
              <td>Opening Price</td>
              <td>{formatCurrency(quote.open)}</td>
            </tr>
            <tr>
              <td>Current Momentum (30D)</td>
              <td>{
                analytics.momentum30d != null
                  ? `${analytics.momentum30d > 0 ? "+" : ""}${analytics.momentum30d.toFixed(1)}%`
                  : "–"
              }</td>
            </tr>
            <tr>
              <td>Realised Volatility</td>
              <td>{analytics.volatility != null ? `₹${analytics.volatility.toFixed(2)}` : "–"}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="section">
        <h2 style={{ marginTop: 0 }}>Quick Takeaways</h2>
        <div className="summary-grid">
          {summaryCards.map((card, idx) => (
            <div key={idx} className="summary-card">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="footer">
        Data source: Yahoo Finance · NSE: INTELLECT · Refreshed every 5 minutes
      </div>
    </main>
  );
}
