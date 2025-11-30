import { redirect, notFound } from "next/navigation"
import { getSession } from "@/lib/auth"
import { getCategories } from "@/lib/data-actions"
import { getUserSettings } from "@/lib/settings-actions"
import { sql } from "@/lib/db"
import { DashboardShell } from "@/components/dashboard-shell"
import { TransactionForm } from "@/components/transaction-form"
import type { Transaction } from "@/lib/db"

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/login")

  const { id } = await params
  const transactionId = Number.parseInt(id)

  if (isNaN(transactionId)) {
    notFound()
  }

  const [categories, transactions, settings] = await Promise.all([
    getCategories(),
    sql`
      SELECT t.*, c.name as category_name 
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.id = ${transactionId} AND t.user_id = ${session.id}
    `,
    getUserSettings()
  ])

  if (transactions.length === 0) {
    notFound()
  }

  const transaction = transactions[0] as Transaction

  return (
    <DashboardShell user={session}>
      <TransactionForm 
        categories={categories} 
        transaction={transaction}
        currency={settings?.currency || "USD"}
      />
    </DashboardShell>
  )
}