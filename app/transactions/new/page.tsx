import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { getCategories } from "@/lib/data-actions"
import { getUserSettings } from "@/lib/settings-actions"
import { DashboardShell } from "@/components/dashboard-shell"
import { TransactionForm } from "@/components/transaction-form"

export default async function NewTransactionPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const [categories, settings] = await Promise.all([
    getCategories(),
    getUserSettings()
  ])

  return (
    <DashboardShell user={session}>
      <TransactionForm categories={categories} currency={settings?.currency || "USD"} />
    </DashboardShell>
  )
}