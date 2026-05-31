import React from 'react';
import { DollarSign, ShoppingCart, Users, Layers } from 'lucide-react';

export default function AdminOverview({ stats }) {
  const { revenue, totalOrders, traffic, conversionRate, aov, salesHistory = [], categoryBreakdown = {} } = stats;

  // Monthly revenue target benchmark
  const targetRevenue = 5000;
  const targetPercentage = Math.min(100, (revenue / targetRevenue) * 100);

  // SVG Gauge calculations
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  };

  // Convert targetPercentage to degrees for the semi-circle gauge (from -90 to +90 deg)
  const gaugeAngle = -90 + (targetPercentage / 100) * 180;

  // Custom SVG Line Chart coordinates
  const renderLineChart = () => {
    if (salesHistory.length === 0) return <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No sales data recorded yet.</p>;

    const width = 500;
    const height = 150;
    const padding = 20;
    
    const maxVal = Math.max(...salesHistory.map(d => d.amount), 100);
    const points = salesHistory.map((d, i) => {
      const x = padding + (i * (width - padding * 2)) / (salesHistory.length - 1);
      const y = height - padding - (d.amount / maxVal) * (height - padding * 2);
      return { x, y, label: d.date, val: d.amount };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = padding + ratio * (height - padding * 2);
          return (
            <line
              key={idx}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="rgba(0, 229, 255, 0.1)"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Shadow area under line */}
        {points.length > 1 && (
          <path
            d={`${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
            fill="url(#chart-glow)"
            opacity="0.15"
          />
        )}

        {/* The plot line */}
        <path
          d={linePath}
          fill="none"
          stroke="#00e5ff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 3px rgba(0,229,255,0.5))' }}
        />

        {/* Nodes and Tooltips */}
        {points.map((p, idx) => (
          <g key={idx} className="chart-node">
            <circle
              cx={p.x}
              cy={p.y}
              r="5"
              fill="#0b131a"
              stroke="#00e5ff"
              strokeWidth="2.5"
              style={{ cursor: 'pointer' }}
            />
            {/* Value indicator text */}
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              fill="#00e5ff"
              fontSize="9"
              fontFamily="var(--font-mono)"
              fontWeight="bold"
            >
              ₹{p.val.toFixed(0)}
            </text>
            {/* X-axis date labels */}
            <text
              x={p.x}
              y={height - 2}
              textAnchor="middle"
              fill="#9cb0cc"
              fontSize="8"
              fontFamily="var(--font-sans)"
              fontWeight="bold"
            >
              {p.label}
            </text>
          </g>
        ))}

        {/* Gradients */}
        <defs>
          <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Upper Metrics Grid: Skeuomorphic LCD counters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px'
      }}>
        {[
          { label: 'TOTAL REVENUE', value: `₹${revenue.toFixed(2)}`, secondary: `Goal: ₹${targetRevenue}`, icon: <DollarSign size={20} />, color: 'green' },
          { label: 'TOTAL ORDERS', value: totalOrders, secondary: 'Processed successfully', icon: <ShoppingCart size={20} />, color: 'blue' },
          { label: 'CONVERSION RATE', value: `${conversionRate}%`, secondary: `Visits: ${traffic}`, icon: <Users size={20} />, color: 'amber' },
          { label: 'AVERAGE ORDER VALUE', value: `₹${aov.toFixed(2)}`, secondary: 'Per order bill', icon: <Layers size={20} />, color: 'blue' }
        ].map((card, idx) => (
          <div key={idx} className="skeuo-outset" style={{ padding: '20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#eef2f7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>{card.label}</span>
              <div className="skeuo-inset-sm" style={{ padding: '6px', borderRadius: '50%', color: 'var(--text-primary)' }}>
                {card.icon}
              </div>
            </div>
            
            {/* The Digital Counter Display */}
            <div className={`lcd-screen ${card.color}`} style={{ padding: '10px 14px', fontSize: '20px', fontWeight: 700 }}>
              {card.value}
            </div>

            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>{card.secondary}</span>
          </div>
        ))}
      </div>

      {/* Middle Grid: Gauges & Custom Graph */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '24px',
        alignItems: 'stretch'
      }}>
        {/* Left: Semi-circle needle dial gauge */}
        <div className="skeuo-outset" style={{ padding: '24px', backgroundColor: '#eef2f7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>
            REVENUE GOAL
          </h3>
          
          <div style={{ position: 'relative', width: '180px', height: '110px' }}>
            <svg width="180" height="110" viewBox="0 0 180 110">
              {/* Arc background path */}
              <path
                d={describeArc(90, 95, 75, -90, 90)}
                fill="none"
                stroke="#d1d9e6"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Colored progress arc path */}
              {targetPercentage > 0 && (
                <path
                  d={describeArc(90, 95, 75, -90, -90 + (targetPercentage / 100) * 180)}
                  fill="none"
                  stroke="url(#gauge-gradient)"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
              )}
              {/* Target threshold tick line */}
              <line x1="90" y1="20" x2="90" y2="10" stroke="var(--text-secondary)" strokeWidth="2" />
              
              {/* The Needle pointer */}
              <g transform={`rotate(${gaugeAngle}, 90, 95)`}>
                <line x1="90" y1="95" x2="90" y2="28" stroke="#e74c3c" strokeWidth="3.5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))' }} />
                <circle cx="90" cy="95" r="7" fill="#e74c3c" />
              </g>

              {/* Central screw button */}
              <circle cx="90" cy="95" r="4" fill="#a3b1c6" />
              
              <defs>
                <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f39c12" />
                  <stop offset="70%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#2ecc71" />
                </linearGradient>
              </defs>
            </svg>

            {/* Analog Label Display */}
            <div style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 800 }}>TARGET INDEX</span>
              <span className="lcd-screen green" style={{ padding: '2px 8px', fontSize: '12px', borderRadius: '4px', marginTop: '4px' }}>
                {targetPercentage.toFixed(0)}% GOAL
              </span>
            </div>
          </div>
        </div>

        {/* Right: Glowing Vector Line Graph */}
        <div className="metal-brushed stitch-border-light" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#9cb0cc', textTransform: 'uppercase', letterSpacing: '1px' }}>
              SALES GRAPH (LAST 7 DAYS)
            </h3>
            <div className="led-indicator green" title="Real-time Stream"></div>
          </div>

          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="card-slot">
            {renderLineChart()}
          </div>
        </div>
      </div>

      {/* Category breakdown database records */}
      <div className="skeuo-outset" style={{ padding: '24px', backgroundColor: '#eef2f7' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px', textAlign: 'left' }}>
          SALES BY CATEGORY
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {Object.entries(categoryBreakdown).length > 0 ? (
            Object.entries(categoryBreakdown).map(([category, value]) => {
              const categoryPercent = (value / revenue) * 100;
              return (
                <div key={category} className="skeuo-inset-sm" style={{ padding: '16px', backgroundColor: '#e6edf7', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>{category}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 800 }}>₹{value.toFixed(2)}</span>
                  </div>
                  
                  {/* Progress bar container (outset) */}
                  <div className="skeuo-outset-sm" style={{ height: '10px', width: '100%', overflow: 'hidden', borderRadius: '5px', backgroundColor: 'rgba(0,0,0,0.05)', border: 'none' }}>
                    <div style={{
                      height: '100%',
                      width: `${categoryPercent}%`,
                      background: 'linear-gradient(90deg, var(--accent-gold), #ffd043)',
                      borderRadius: '5px',
                      boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4)'
                    }}></div>
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>{categoryPercent.toFixed(1)}% of revenue</span>
                </div>
              );
            })
          ) : (
            <p style={{ gridColumn: '1 / -1', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
              No categories have sales history yet.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
