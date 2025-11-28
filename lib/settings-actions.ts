"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export type UserSettings = {
  id: string
  name: string | null
  email: string
  currency: string
  theme: string
}

export async function getUserSettings(): Promise<UserSettings | null> {
  const session = await getSession()
  if (!session) return null

  const result = await sql`
    SELECT id, name, email, currency, theme FROM users WHERE id = ${session.id}
  `

  if (result.length === 0) return null

  return {
    id: result[0].id,
    name: result[0].name,
    email: result[0].email,
    currency: result[0].currency || "USD",
    theme: result[0].theme || "system",
  }
}

export async function updateUserSettings(data: {
  name?: string
  currency?: string
  theme?: string
}) {
  const session = await getSession()
  if (!session) return { error: "Not authenticated" }

  try {
    await sql`
      UPDATE users 
      SET 
        name = COALESCE(${data.name}, name),
        currency = COALESCE(${data.currency}, currency),
        theme = COALESCE(${data.theme}, theme),
        updated_at = NOW()
      WHERE id = ${session.id}
    `
    revalidatePath("/settings")
    revalidatePath("/dashboard")
    revalidatePath("/budget")
    revalidatePath("/transactions")
    return { success: true }
  } catch {
    return { error: "Failed to update settings" }
  }
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  const session = await getSession()
  if (!session) return { error: "Not authenticated" }

  // Import bcrypt dynamically for server-side only
  const bcrypt = await import("bcryptjs")

  // Get current password hash
  const result = await sql`SELECT password_hash FROM users WHERE id = ${session.id}`
  if (result.length === 0) return { error: "User not found" }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, result[0].password_hash)
  if (!isValid) return { error: "Current password is incorrect" }

  // Hash new password
  const newHash = await bcrypt.hash(newPassword, 10)

  await sql`
    UPDATE users SET password_hash = ${newHash}, updated_at = NOW()
    WHERE id = ${session.id}
  `

  return { success: true }
}

export async function deleteAccount() {
  const session = await getSession()
  if (!session) return { error: "Not authenticated" }

  try {
    // Delete all user data in order (respecting foreign keys)
    await sql`DELETE FROM transactions WHERE user_id = ${session.id}`
    await sql`DELETE FROM categories WHERE user_id = ${session.id}`
    await sql`DELETE FROM monthly_stats WHERE user_id = ${session.id}`
    await sql`DELETE FROM users WHERE id = ${session.id}`

    return { success: true }
  } catch {
    return { error: "Failed to delete account" }
  }
}
