import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
} from "recharts";
import { type WeeklyStatItem } from "../../store/useDeliveryStore";

const BRAND = "#FF6B4A";

interface WeeklyActivityChartProps {
  data: WeeklyStatItem[];
}

function CustomBarTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#111", borderRadius: 10, padding: "8px 14px", color: "#fff", fontSize: 13, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
        <p style={{ margin: 0, fontWeight: 700 }}>{label}</p>
        <p style={{ margin: "2px 0 0", color: BRAND, fontWeight: 600 }}>{payload[0].value} deliveries</p>
      </div>
    );
  }
  return null;
}

export default function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
  const currentDayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon, etc.

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F0F0F0", padding: "22px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 4 }}>Weekly Activity</h3>
          <p style={{ fontSize: 12, color: "#AAA" }}>Deliveries completed per day</p>
        </div>
        <span style={{ padding: "4px 10px", borderRadius: 8, background: `rgba(255,107,74,0.10)`, color: BRAND, fontSize: 12, fontWeight: 600 }}>
          This Week
        </span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="35%">
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#AAA" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#AAA" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(255,107,74,0.06)", rx: 6 }} />
          <Bar dataKey="count" fill={BRAND} radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === currentDayIndex ? BRAND : `${BRAND}80`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
