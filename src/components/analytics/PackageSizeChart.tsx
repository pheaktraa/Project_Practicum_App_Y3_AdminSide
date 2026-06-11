import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { type PackageSizeStats } from "../../store/useDeliveryStore";

const BRAND = "#FF6B4A";

interface PackageSizeChartProps {
  data: PackageSizeStats;
}

export default function PackageSizeChart({ data }: PackageSizeChartProps) {
  const pieData = [
    { name: "Small", value: data.small.percentage, color: BRAND },
    { name: "Medium", value: data.medium.percentage, color: "#FFA07A" },
    { name: "Large", value: data.large.percentage, color: "#FFD4C8" },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F0F0F0", padding: "22px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 4 }}>Package Size Breakdown</h3>
      <p style={{ fontSize: 12, color: "#AAA", marginBottom: 20 }}>Breakdown by package size</p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", fontSize: 13 }}
            formatter={(v: any) => [`${v}%`, ""]}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Custom legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        {pieData.map((d) => (
          <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }} />
              <span style={{ fontSize: 13, color: "#555" }}>{d.name}</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
