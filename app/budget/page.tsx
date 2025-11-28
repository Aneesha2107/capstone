import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { getCategories } from "@/lib/data-actions"
import { DashboardShell } from "@/components/dashboard-shell"
import { BudgetContent } from "@/components/budget-content"

export default async function BudgetPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const categories = await getCategories()

  return (
    <DashboardShell user={session}>
      <BudgetContent categories={categories} />
    </DashboardShell>
  )
}
