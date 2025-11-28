"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts"

type CategoryData = {
  id: number
  name: string
  budget: number
  spent: number
}

const BUDGET_COLOR = "#0d9488"
const SPENT_COLOR = "#f97316"

export function BudgetVsSpendChart({ data }: { data: CategoryData[] }) {
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No budget data available. Set up your budgets to see insights.
      </div>
    )
  }

  const chartData = data
    .filter((d) => d.budget > 0 || d.spent > 0)
    .map((d) => ({
      name: d.name.length > 12 ? d.name.slice(0, 12) + "..." : d.name,
      fullName: d.name,
      Budget: d.budget,
      Spent: d.spent,
    }))

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
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
          <Legend />
          <Bar dataKey="Budget" fill={BUDGET_COLOR} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Spent" fill={SPENT_COLOR} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
