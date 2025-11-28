"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTransaction, updateTransaction } from "@/lib/data-actions"
import type { Category, Transaction } from "@/lib/types"
import { Loader2, ArrowLeft, Receipt } from "lucide-react"
import Link from "next/link"

export function TransactionForm({
  categories,
  transaction,
}: {
  categories: Category[]
  transaction?: Transaction
}) {
  const router = useRouter()
  const isEditing = !!transaction

  const [categoryId, setCategoryId] = useState(transaction?.category_id?.toString() || "")
  const [amount, setAmount] = useState(transaction?.amount?.toString() || "")
  const [date, setDate] = useState(
    transaction?.date ? new Date(transaction.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
  )
  const [notes, setNotes] = useState(transaction?.notes || "")
  const [isRecurring, setIsRecurring] = useState(transaction?.is_recurring || false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!categoryId) {
      setError("Please select a category")
      return
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setIsLoading(true)

    const data = {
      categoryId: Number.parseInt(categoryId),
      amount: Number.parseFloat(amount),
      date,
      isRecurring,
      notes,
    }

    const result = isEditing ? await updateTransaction(transaction.id, data) : await createTransaction(data)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    router.push("/transactions")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/transactions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{isEditing ? "Edit Transaction" : "Add New Expense"}</h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update the transaction details" : "Record a new spending transaction"}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Transaction Details
          </CardTitle>
          <CardDescription>Fill in the details of your expense</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">{error}</div>}

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-8 text-lg"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add a description or notes about this expense..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Recurring Toggle */}
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="recurring" className="text-base cursor-pointer">
                  Recurring Expense
                </Label>
                <p className="text-sm text-muted-foreground">Mark if this is a regular monthly expense</p>
              </div>
              <Switch id="recurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating..." : "Saving..."}
                  </>
                ) : isEditing ? (
                  "Update Transaction"
                ) : (
                  "Save Transaction"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
