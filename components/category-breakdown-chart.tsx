"use client"

import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

type CategoryData = {
  id: number
  name: string
  budget: number
  spent: number
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function CategoryBreakdownChart({ data }: { data: CategoryData[] }) {
  if (data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
        No spending data available.
      </div>
    )
  }

  const sortedData = [...data].sort((a, b) => b.spent - a.spent).slice(0, 8)
  const totalSpent = data.reduce((sum, d) => sum + d.spent, 0)

  return (
    <div className="space-y-4">
      {sortedData.map((category) => {
        const percentage = category.budget > 0 ? (category.spent / category.budget) * 100 : 0
        const isOverBudget = percentage > 100
        const shareOfTotal = totalSpent > 0 ? (category.spent / totalSpent) * 100 : 0

        return (
          <div key={category.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{category.name}</span>
                <span className="text-xs text-muted-foreground">({shareOfTotal.toFixed(0)}% of total)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("font-medium", isOverBudget ? "text-destructive" : "text-foreground")}>
                  {formatCurrency(category.spent)}
                </span>
                {category.budget > 0 && (
                  <span className="text-muted-foreground">/ {formatCurrency(category.budget)}</span>
                )}
              </div>
            </div>
            <Progress
              value={Math.min(percentage, 100)}
              className={cn("h-2", isOverBudget && "[&>div]:bg-destructive")}
            />
          </div>
        )
      })}
    </div>
  )
}
