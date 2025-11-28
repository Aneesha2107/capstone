export type User = {
  id: string
  name: string | null
  email: string
  currency: string
  theme: string
  created_at: Date
  updated_at: Date
}

export type Category = {
  id: number
  user_id: string
  name: string
  is_default: boolean
  monthly_budget: number
  icon: string
  created_at: Date
  updated_at: Date
}

export type Transaction = {
  id: number
  user_id: string
  category_id: number
  amount: number
  date: string
  is_recurring: boolean
  notes: string | null
  created_at: Date
  updated_at: Date
  category_name?: string
}

export type MonthlyStats = {
  id: number
  user_id: string
  month: string
  total_spent: number
  total_budget: number
  created_at: Date
  updated_at: Date
}

// Default categories for new users
export const DEFAULT_CATEGORIES = [
  { name: "Food & Groceries", icon: "utensils" },
  { name: "Rent / EMI", icon: "home" },
  { name: "Utilities", icon: "zap" },
  { name: "Transport", icon: "car" },
  { name: "Entertainment", icon: "film" },
  { name: "Health & Medical", icon: "heart" },
  { name: "Shopping", icon: "shopping-bag" },
  { name: "Savings", icon: "piggy-bank" },
  { name: "Others", icon: "more-horizontal" },
]
