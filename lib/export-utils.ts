import { formatCurrency } from "./currency"

type ChartData = Record<string, string | number>[]

export function downloadCSV(data: ChartData, filename: string, currency: string) {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvRows = [headers.join(",")]

  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header]
      // Escape commas and quotes in string values
      if (typeof val === "string") {
        return `"${val.replace(/"/g, '""')}"`
      }
      return val
    })
    csvRows.push(values.join(","))
  }

  const csvContent = csvRows.join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function downloadChartAsImage(chartRef: HTMLDivElement | null, filename: string) {
  if (!chartRef) return

  // Use html2canvas approach via SVG
  const svgElement = chartRef.querySelector("svg")
  if (!svgElement) return

  const svgData = new XMLSerializer().serializeToString(svgElement)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  const img = new Image()

  // Set canvas size
  const { width, height } = svgElement.getBoundingClientRect()
  canvas.width = width * 2
  canvas.height = height * 2

  img.onload = () => {
    if (ctx) {
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.scale(2, 2)
      ctx.drawImage(img, 0, 0)

      const pngUrl = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `${filename}-${new Date().toISOString().split("T")[0]}.png`
      link.href = pngUrl
      link.click()
    }
  }

  img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
}

export function exportStatsToCSV(
  stats: {
    totalBudget: number
    totalSpent: number
    remaining: number
    recurring: number
    nonRecurring: number
  },
  month: string,
  currency: string,
) {
  const data = [
    {
      Month: month,
      "Total Budget": formatCurrency(stats.totalBudget, currency),
      "Total Spent": formatCurrency(stats.totalSpent, currency),
      Remaining: formatCurrency(stats.remaining, currency),
      "Recurring Expenses": formatCurrency(stats.recurring, currency),
      "One-time Expenses": formatCurrency(stats.nonRecurring, currency),
    },
  ]

  downloadCSV(data, `financial-summary-${month}`, currency)
}

export function exportAllData(
  stats: {
    totalBudget: number
    totalSpent: number
    remaining: number
    recurring: number
    nonRecurring: number
    categorySpending: { name: string; budget: number; spent: number }[]
  },
  history: { month: string; spent: number; budget: number }[],
  month: string,
  currency: string,
) {
  // Create comprehensive report
  const lines: string[] = []

  // Header
  lines.push("PERSONAL FINANCE REPORT")
  lines.push(`Generated: ${new Date().toLocaleDateString()}`)
  lines.push(`Currency: ${currency}`)
  lines.push(`Month: ${month}`)
  lines.push("")

  // Summary Section
  lines.push("=== MONTHLY SUMMARY ===")
  lines.push(`Total Budget,${formatCurrency(stats.totalBudget, currency)}`)
  lines.push(`Total Spent,${formatCurrency(stats.totalSpent, currency)}`)
  lines.push(`Remaining,${formatCurrency(stats.remaining, currency)}`)
  lines.push(`Recurring Expenses,${formatCurrency(stats.recurring, currency)}`)
  lines.push(`One-time Expenses,${formatCurrency(stats.nonRecurring, currency)}`)
  lines.push("")

  // Category Breakdown
  lines.push("=== CATEGORY BREAKDOWN ===")
  lines.push("Category,Budget,Spent,Remaining,% Used")
  for (const cat of stats.categorySpending) {
    const remaining = cat.budget - cat.spent
    const percentUsed = cat.budget > 0 ? ((cat.spent / cat.budget) * 100).toFixed(1) : "0"
    lines.push(
      `${cat.name},${formatCurrency(cat.budget, currency)},${formatCurrency(cat.spent, currency)},${formatCurrency(remaining, currency)},${percentUsed}%`,
    )
  }
  lines.push("")

  // Monthly History
  lines.push("=== MONTHLY HISTORY ===")
  lines.push("Month,Budget,Spent,Difference")
  for (const h of history) {
    const diff = h.budget - h.spent
    lines.push(
      `${h.month},${formatCurrency(h.budget, currency)},${formatCurrency(h.spent, currency)},${formatCurrency(diff, currency)}`,
    )
  }

  const csvContent = lines.join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `finance-report-${month}-${new Date().toISOString().split("T")[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
