import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { getUserSettings } from "@/lib/settings-actions"
import { DashboardShell } from "@/components/dashboard-shell"
import { SettingsContent } from "@/components/settings-content"

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const settings = await getUserSettings()
  if (!settings) redirect("/login")

  return (
    <DashboardShell user={session}>
      <SettingsContent settings={settings} />
    </DashboardShell>
  )
}
