"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { createToken, hashPassword, verifyPassword, DEFAULT_CATEGORIES } from "@/lib/auth"
import type { AuthUser } from "@/lib/auth"

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  if (!email || !password || !name) {
    return { error: "All fields are required" }
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" }
  }

  // Check if user exists
  const existing = await sql`SELECT id FROM users WHERE email = ${email}`
  if (existing.length > 0) {
    return { error: "Email already registered" }
  }

  const id = crypto.randomUUID()
  const passwordHash = await hashPassword(password)

  // Create user
  await sql`
    INSERT INTO users (id, email, name, currency)
    VALUES (${id}, ${email}, ${name}, 'USD')
  `

  // Store credentials
  await sql`
    INSERT INTO user_credentials (user_id, password_hash)
    VALUES (${id}, ${passwordHash})
  `

  // Create default categories
  for (const cat of DEFAULT_CATEGORIES) {
    await sql`
      INSERT INTO categories (user_id, name, is_default, icon, monthly_budget)
      VALUES (${id}, ${cat.name}, true, ${cat.icon}, 0)
    `
  }

  const user: AuthUser = { id, email, name, currency: "USD" }
  const token = await createToken(user)

  const cookieStore = await cookies()
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  redirect("/dashboard")
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  // Get user and credentials
  const users = await sql`
    SELECT u.id, u.email, u.name, u.currency, c.password_hash
    FROM users u
    JOIN user_credentials c ON u.id = c.user_id
    WHERE u.email = ${email}
  `

  if (users.length === 0) {
    return { error: "Invalid email or password" }
  }

  const user = users[0]
  const isValid = await verifyPassword(password, user.password_hash)

  if (!isValid) {
    return { error: "Invalid email or password" }
  }

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    currency: user.currency,
  }

  const token = await createToken(authUser)

  const cookieStore = await cookies()
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  })

  redirect("/dashboard")
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete("auth_token")
  redirect("/login")
}
