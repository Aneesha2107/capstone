"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip } from "recharts"

type MonthlyData = {
  month: string
  spent: number
  budget: number
}

const SPENT_COLOR = "#0d9488"
const BUDGET_COLOR = "#94a3b8"

function formatMonthShort(month: string) {
  const [year, monthNum] = month.split("-")
  const date = new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1)
  return date.toLocaleDateString("en-US", { month: "short" })
}

export function MonthlyTrendChart({ data }: { data: MonthlyData[] }) {
  if (data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
        No spending history yet. Add transactions to see trends.
      </div>
    )
  }

  const chartData = data.map((d) => ({
    month: formatMonthShort(d.month),
    fullMonth: d.month,
    Spent: d.spent,
    Budget: d.budget,
  }))

  const avgBudget = data.length > 0 ? data[0].budget : 0

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} />
          <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(0)}`, undefined]}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
          />
          {avgBudget > 0 && (
            <ReferenceLine
              y={avgBudget}
              stroke={BUDGET_COLOR}
              strokeDasharray="5 5"
              label={{ value: "Budget", fill: "#6b7280", fontSize: 10 }}
            />
          )}
          <Line
            type="monotone"
            dataKey="Spent"
            stroke={SPENT_COLOR}
            strokeWidth={2}
            dot={{ fill: SPENT_COLOR, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
