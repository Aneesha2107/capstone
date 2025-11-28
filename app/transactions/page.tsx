import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { getCategories, getTransactionsByMonth } from "@/lib/data-actions"
import { DashboardShell } from "@/components/dashboard-shell"
import { TransactionsList } from "@/components/transactions-list"

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/login")

  const params = await searchParams
  const currentMonth = params.month || new Date().toISOString().slice(0, 7)

  const [categories, transactions] = await Promise.all([getCategories(), getTransactionsByMonth(currentMonth)])

  return (
    <DashboardShell user={session}>
      <TransactionsList transactions={transactions} categories={categories} currentMonth={currentMonth} />
    </DashboardShell>
  )
}
