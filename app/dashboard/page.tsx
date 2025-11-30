import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { getMonthlyInsights, getMonthlyHistory } from "@/lib/data-actions"
import { getUserSettings } from "@/lib/settings-actions"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardContent } from "@/components/dashboard-content"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/login")

  const params = await searchParams
  const currentMonth = params.month || new Date().toISOString().slice(0, 7)

  const [insights, history, settings] = await Promise.all([
    getMonthlyInsights(currentMonth),
    getMonthlyHistory(),
    getUserSettings(),
  ])

  return (
    <DashboardShell user={session}>
      <DashboardContent
        insights={insights}
        history={history}
        currentMonth={currentMonth}
        userName={session.name || "User"}
        currency={settings?.currency || "USD"}
      />
    </DashboardShell>
  )
}
