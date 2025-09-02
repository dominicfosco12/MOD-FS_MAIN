// src/components/widgets/LiveKPIs.jsx

export default function LiveKPIs() {
  return (
    <div className="panel-card">
      <h3>Firm KPIs</h3>
      <ul>
        <li>Net Exposure: <span className="kpi">+3.2M</span></li>
        <li>Cash Available: <span className="kpi">$1.2M</span></li>
        <li>Open Orders: <span className="kpi">14</span></li>
        <li>Today's Trades: <span className="kpi">57</span></li>
      </ul>
    </div>
  )
}
