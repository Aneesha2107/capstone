"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BudgetVsSpendChart } from "@/components/budget-vs-spend-chart"
import { MonthlyTrendChart } from "@/components/monthly-trend-chart"
import { RecurringPieChart } from "@/components/recurring-pie-chart"
import { CategoryBreakdownChart } from "@/components/category-breakdown-chart"
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency, convertFromUSD } from "@/lib/currency"
import { exportSimplifiedPDF } from "@/lib/export-utils"

type InsightsData = {
  totalBudget: number
  totalSpent: number
  remaining: number
  categorySpending: {
    id: number
    name: string
    budget: number
    spent: number
    icon: string
  }[]
  recurring: number
  nonRecurring: number
} | null

type HistoryData = {
  month: string
  spent: number
  budget: number
}[]

function formatMonth(month: string) {
  const [year, monthNum] = month.split("-")
  const date = new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1)
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function getAvailableMonths() {
  const months: string[] = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(date.toISOString().slice(0, 7))
  }
  return months
}

export function DashboardContent({
  insights,
  history,
  currentMonth,
  userName,
  currency = "USD",
}: {
  insights: InsightsData
  history: HistoryData
  currentMonth: string
  userName: string
  currency?: string
}) {
  const router = useRouter()
  const availableMonths = getAvailableMonths()

  const convertedInsights = insights
    ? {
        totalBudget: convertFromUSD(insights.totalBudget, currency),
        totalSpent: convertFromUSD(insights.totalSpent, currency),
        remaining: convertFromUSD(insights.remaining, currency),
        recurring: convertFromUSD(insights.recurring, currency),
        nonRecurring: convertFromUSD(insights.nonRecurring, currency),
        categorySpending: insights.categorySpending.map((c) => ({
          ...c,
          budget: convertFromUSD(c.budget, currency),
          spent: convertFromUSD(c.spent, currency),
        })),
      }
    : null

  const convertedHistory = history.map((h) => ({
    ...h,
    spent: convertFromUSD(h.spent, currency),
    budget: convertFromUSD(h.budget, currency),
  }))

  const handleMonthChange = (month: string) => {
    router.push(`/dashboard?month=${month}`)
  }

  const goToPreviousMonth = () => {
    const currentIndex = availableMonths.indexOf(currentMonth)
    if (currentIndex < availableMonths.length - 1) {
      handleMonthChange(availableMonths[currentIndex + 1])
    }
  }

  const goToNextMonth = () => {
    const currentIndex = availableMonths.indexOf(currentMonth)
    if (currentIndex > 0) {
      handleMonthChange(availableMonths[currentIndex - 1])
    }
  }

  const spentPercentage = convertedInsights
    ? (convertedInsights.totalSpent / (convertedInsights.totalBudget || 1)) * 100
    : 0
  const isOverBudget = spentPercentage > 100

  const handleExportAll = () => {
    if (convertedInsights) {
      exportSimplifiedPDF(convertedInsights, currentMonth,currency)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {userName.split(" ")[0]}</h1>
          <p className="text-muted-foreground">Here's your financial overview for {formatMonth(currentMonth)}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportAll}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            disabled={availableMonths.indexOf(currentMonth) >= availableMonths.length - 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Select value={currentMonth} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map((month) => (
                <SelectItem key={month} value={month}>
                  {formatMonth(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            disabled={availableMonths.indexOf(currentMonth) <= 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(convertedInsights?.totalBudget || 0, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Monthly allocation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
            {isOverBudget ? (
              <TrendingUp className="h-4 w-4 text-destructive" />
            ) : (
              <TrendingDown className="h-4 w-4 text-success" />
            )}
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", isOverBudget ? "text-destructive" : "text-foreground")}>
              {formatCurrency(convertedInsights?.totalSpent || 0, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{spentPercentage.toFixed(0)}% of budget used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                (convertedInsights?.remaining || 0) < 0 ? "text-destructive" : "text-success",
              )}
            >
              {formatCurrency(convertedInsights?.remaining || 0, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(convertedInsights?.remaining || 0) >= 0 ? "Available to spend" : "Over budget"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recurring</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(convertedInsights?.recurring || 0, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Fixed monthly expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid - Removed individual export buttons */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Budget vs Spend by Category */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Budget vs Spending by Category</CardTitle>
            <CardDescription>Compare your budget allocation with actual spending</CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetVsSpendChart data={convertedInsights?.categorySpending || []} currency={currency} />
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Spending Trend</CardTitle>
            <CardDescription>Your spending pattern over the last few months</CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyTrendChart data={convertedHistory} currency={currency} />
          </CardContent>
        </Card>

        {/* Recurring vs Non-Recurring */}
        <Card>
          <CardHeader>
            <CardTitle>Recurring vs One-time</CardTitle>
            <CardDescription>Breakdown of your expense types</CardDescription>
          </CardHeader>
          <CardContent>
            <RecurringPieChart
              recurring={convertedInsights?.recurring || 0}
              nonRecurring={convertedInsights?.nonRecurring || 0}
              currency={currency}
            />
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Category Spending Breakdown</CardTitle>
            <CardDescription>Where your money is going this month</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryBreakdownChart data={convertedInsights?.categorySpending || []} currency={currency} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
