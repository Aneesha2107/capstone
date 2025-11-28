"use server"

import { sql, type Category, type Transaction } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Category Actions
export async function getCategories(): Promise<Category[]> {
  const session = await getSession()
  if (!session) return []

  const categories = await sql`
    SELECT * FROM categories WHERE user_id = ${session.id} ORDER BY name
  `
  return categories as Category[]
}

export async function createCategory(name: string, monthlyBudget = 0) {
  const session = await getSession()
  if (!session) return { error: "Not authenticated" }

  try {
    await sql`
      INSERT INTO categories (user_id, name, is_default, monthly_budget, icon)
      VALUES (${session.id}, ${name}, false, ${monthlyBudget}, 'circle')
    `
    revalidatePath("/budget")
    revalidatePath("/dashboard")
    return { success: true }
  } catch {
    return { error: "Category already exists" }
  }
}

export async function updateCategoryBudget(categoryId: number, monthlyBudget: number) {
  const session = await getSession()
  if (!session) return { error: "Not authenticated" }

  await sql`
    UPDATE categories SET monthly_budget = ${monthlyBudget}, updated_at = NOW()
    WHERE id = ${categoryId} AND user_id = ${session.id}
  `
  revalidatePath("/budget")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteCategory(categoryId: number) {
  const session = await getSession()
  if (!session) return { error: "Not authenticated" }

  // Check if category has transactions
  const transactions = await sql`
    SELECT COUNT(*) as count FROM transactions 
    WHERE category_id = ${categoryId} AND user_id = ${session.id}
  `

  if (Number(transactions[0].count) > 0) {
    return { error: "Cannot delete category with transactions" }
  }

  await sql`
    DELETE FROM categories WHERE id = ${categoryId} AND user_id = ${session.id} AND is_default = false
  `
  revalidatePath("/budget")
  revalidatePath("/dashboard")
  return { success: true }
}

// Transaction Actions
export async function getTransactionsByMonth(month: string): Promise<Transaction[]> {
  const session = await getSession()
  if (!session) return []

  const transactions = await sql`
    SELECT t.*, c.name as category_name 
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ${session.id}
    AND TO_CHAR(t.date, 'YYYY-MM') = ${month}
    ORDER BY t.date DESC, t.created_at DESC
  `
  return transactions as Transaction[]
}

export async function createTransaction(data: {
  categoryId: number
  amount: number
  date: string
  isRecurring: boolean
  notes: string
}) {
  const session = await getSession()
  if (!session) return { error: "Not authenticated" }

  await sql`
    INSERT INTO transactions (user_id, category_id, amount, date, is_recurring, notes)
    VALUES (${session.id}, ${data.categoryId}, ${data.amount}, ${data.date}, ${data.isRecurring}, ${data.notes})
  `
  revalidatePath("/transactions")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function updateTransaction(
  id: number,
  data: {
    categoryId: number
    amount: number
    date: string
    isRecurring: boolean
    notes: string
  },
) {
  const session = await getSession()
  if (!session) return { error: "Not authenticated" }

  await sql`
    UPDATE transactions 
    SET category_id = ${data.categoryId}, amount = ${data.amount}, 
        date = ${data.date}, is_recurring = ${data.isRecurring}, 
        notes = ${data.notes}, updated_at = NOW()
    WHERE id = ${id} AND user_id = ${session.id}
  `
  revalidatePath("/transactions")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteTransaction(id: number) {
  const session = await getSession()
  if (!session) return { error: "Not authenticated" }

  await sql`DELETE FROM transactions WHERE id = ${id} AND user_id = ${session.id}`
  revalidatePath("/transactions")
  revalidatePath("/dashboard")
  return { success: true }
}

// Insights Actions
export async function getMonthlyInsights(month: string) {
  const session = await getSession()
  if (!session) return null

  // Get total budget from categories
  const budgetResult = await sql`
    SELECT COALESCE(SUM(monthly_budget), 0) as total_budget FROM categories WHERE user_id = ${session.id}
  `

  // Get total spent for the month
  const spentResult = await sql`
    SELECT COALESCE(SUM(amount), 0) as total_spent FROM transactions 
    WHERE user_id = ${session.id} AND TO_CHAR(date, 'YYYY-MM') = ${month}
  `

  // Get spending by category
  const categorySpending = await sql`
    SELECT c.id, c.name, c.monthly_budget, c.icon,
           COALESCE(SUM(t.amount), 0) as spent
    FROM categories c
    LEFT JOIN transactions t ON c.id = t.category_id 
      AND TO_CHAR(t.date, 'YYYY-MM') = ${month}
    WHERE c.user_id = ${session.id}
    GROUP BY c.id, c.name, c.monthly_budget, c.icon
    ORDER BY spent DESC
  `

  // Get recurring vs non-recurring
  const recurringStats = await sql`
    SELECT 
      COALESCE(SUM(CASE WHEN is_recurring THEN amount ELSE 0 END), 0) as recurring,
      COALESCE(SUM(CASE WHEN NOT is_recurring THEN amount ELSE 0 END), 0) as non_recurring
    FROM transactions 
    WHERE user_id = ${session.id} AND TO_CHAR(date, 'YYYY-MM') = ${month}
  `

  return {
    totalBudget: Number(budgetResult[0].total_budget),
    totalSpent: Number(spentResult[0].total_spent),
    remaining: Number(budgetResult[0].total_budget) - Number(spentResult[0].total_spent),
    categorySpending: categorySpending.map((c) => ({
      id: c.id,
      name: c.name,
      budget: Number(c.monthly_budget),
      spent: Number(c.spent),
      icon: c.icon,
    })),
    recurring: Number(recurringStats[0].recurring),
    nonRecurring: Number(recurringStats[0].non_recurring),
  }
}

export async function getMonthlyHistory() {
  const session = await getSession()
  if (!session) return []

  const history = await sql`
    SELECT 
      TO_CHAR(date, 'YYYY-MM') as month,
      SUM(amount) as total_spent
    FROM transactions 
    WHERE user_id = ${session.id}
    GROUP BY TO_CHAR(date, 'YYYY-MM')
    ORDER BY month DESC
    LIMIT 12
  `

  // Get total budget (assuming it's constant across months)
  const budgetResult = await sql`
    SELECT COALESCE(SUM(monthly_budget), 0) as total_budget FROM categories WHERE user_id = ${session.id}
  `
  const totalBudget = Number(budgetResult[0].total_budget)

  return history
    .map((h) => ({
      month: h.month,
      spent: Number(h.total_spent),
      budget: totalBudget,
    }))
    .reverse()
}
