import { formatCurrency } from "./currency"

type SimplifiedReportData = {
  totalBudget: number
  totalSpent: number
  remaining: number
  categorySpending: { name: string; spent: number; budget: number }[]
}

export function exportSimplifiedPDF(
  stats: SimplifiedReportData,
  month: string,
  currency: string
) {
  // Create a clean HTML structure for the PDF
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Monthly Finance Report - ${month}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
          color: #1a1a1a;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #0d9488;
        }
        .header h1 {
          font-size: 28px;
          color: #0d9488;
          margin-bottom: 8px;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          margin-top: 20px;
          padding-left: 5px;
        
        }
        .header .date {
          font-size: 16px;
          color: #666;
        }
        .summary {
          background: #f8fafc;
          padding: 24px;
          border-radius: 8px;
          margin-bottom: 32px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .summary-row:last-child {
          border-bottom: none;
          font-weight: bold;
          font-size: 18px;
        }
        .summary-label {
          color: #475569;
        }
        .summary-value {
          font-weight: 600;
        }
        .summary-value.positive {
          color: #16a34a;
        }
        .summary-value.negative {
          color: #dc2626;
        }
        .section-title {
          font-size: 20px;
          font-weight: bold;
          margin: 32px 0 16px;
          color: #1e293b;
        }
        .category-list {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }
        .category-item {
          display: flex;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e2e8f0;
        }
        .category-item:last-child {
          border-bottom: none;
        }
        .category-name {
          font-weight: 500;
          color: #334155;
        }
        .category-amounts {
          text-align: right;
        }
        .spent {
          font-weight: 600;
          color: #0f172a;
        }
        .budget {
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
        }
        .footer {
          margin-top: 48px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          color: #94a3b8;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Monthly Finance Report</h1>
        <div class="date">${formatMonthName(month)}</div>
      </div>

      <div class="summary">
        <div class="summary-row">
          <span class="summary-label">Total Budget</span>
          <span class="summary-value">${formatCurrency(stats.totalBudget, currency)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Total Spent</span>
          <span class="summary-value">${formatCurrency(stats.totalSpent, currency)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Remaining</span>
          <span class="summary-value ${stats.remaining >= 0 ? 'positive' : 'negative'}">
            ${formatCurrency(stats.remaining, currency)}
          </span>
        </div>
      </div>

      <h2 class="section-title">Category Breakdown</h2>
      <div class="category-list">
        ${stats.categorySpending
          .filter(cat => cat.spent > 0)
          .sort((a, b) => b.spent - a.spent)
          .map(
            (cat) => `
          <div class="category-item">
            <span class="category-name">${cat.name}</span>
            <div class="category-amounts">
              <div class="spent">${formatCurrency(cat.spent, currency)}</div>
              ${cat.budget > 0 ? `<div class="budget">Budget: ${formatCurrency(cat.budget, currency)}</div>` : ''}
            </div>
          </div>
        `
          )
          .join("")}
      </div>

      <div class="footer">
        Generated on ${new Date().toLocaleDateString()}
      </div>
    </body>
    </html>
  `

  // Create a new window and trigger print (which can save as PDF)
  const printWindow = window.open("", "_blank")
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    
    // Wait for content to load then trigger print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }
}

function formatMonthName(month: string): string {
  const [year, monthNum] = month.split("-")
  const date = new Date(parseInt(year), parseInt(monthNum) - 1)
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}