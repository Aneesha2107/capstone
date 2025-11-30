// ===== FILE 1: components/budget-content.tsx =====
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createCategory, updateCategoryBudget, deleteCategory } from "@/lib/data-actions"
import type { Category } from "@/lib/types"
import { Plus, Pencil, Trash2, Wallet, Check, X, Loader2 } from "lucide-react"
import { formatCurrency, convertFromUSD, convertToUSD } from "@/lib/currency"

export function BudgetContent({ categories, currency = "USD" }: { categories: Category[]; currency?: string }) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryBudget, setNewCategoryBudget] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Convert categories to display currency
  const displayCategories = categories.map(cat => ({
    ...cat,
    monthly_budget: convertFromUSD(Number(cat.monthly_budget), currency)
  }))

  const totalBudget = displayCategories.reduce((sum, cat) => sum + Number(cat.monthly_budget), 0)

  const handleEditStart = (category: typeof displayCategories[0]) => {
    setEditingId(category.id)
    setEditValue(String(category.monthly_budget))
  }

  const handleEditSave = async (categoryId: number) => {
    setIsLoading(true)
    const amount = Number.parseFloat(editValue) || 0
    // Convert back to USD for storage
    const amountInUSD = convertToUSD(amount, currency)
    await updateCategoryBudget(categoryId, amountInUSD)
    setEditingId(null)
    setIsLoading(false)
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditValue("")
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setError("Category name is required")
      return
    }
    setIsLoading(true)
    setError(null)
    const budget = Number.parseFloat(newCategoryBudget) || 0
    // Convert to USD for storage
    const budgetInUSD = convertToUSD(budget, currency)
    const result = await createCategory(newCategoryName.trim(), budgetInUSD)
    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }
    setNewCategoryName("")
    setNewCategoryBudget("")
    setIsAddOpen(false)
    setIsLoading(false)
  }

  const handleDeleteCategory = async () => {
    if (!deleteId) return
    setIsLoading(true)
    const result = await deleteCategory(deleteId)
    if (result.error) {
      setError(result.error)
    }
    setDeleteId(null)
    setIsLoading(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Budget Setup</h1>
          <p className="text-muted-foreground">Manage your monthly budget allocations by category</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Category</DialogTitle>
              <DialogDescription>Create a new spending category with an optional monthly budget</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  placeholder="e.g., Subscriptions"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-budget">Monthly Budget (optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {currency === "USD" ? "$" : currency}
                  </span>
                  <Input
                    id="category-budget"
                    type="number"
                    placeholder="0"
                    className="pl-7"
                    value={newCategoryBudget}
                    onChange={(e) => setNewCategoryBudget(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Category"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Total Budget Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Total Monthly Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{formatCurrency(totalBudget, currency)}</div>
          <p className="text-sm text-muted-foreground mt-1">Across {displayCategories.length} categories</p>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayCategories.map((category) => (
          <Card key={category.id} className="relative group">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{category.name}</CardTitle>
                  <CardDescription>{category.is_default ? "Default category" : "Custom category"}</CardDescription>
                </div>
                {!category.is_default && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setDeleteId(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingId === category.id ? (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {currency === "USD" ? "$" : currency}
                    </span>
                    <Input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="pl-7"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEditSave(category.id)
                        if (e.key === "Escape") handleEditCancel()
                      }}
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-success hover:text-success"
                    onClick={() => handleEditSave(category.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-9 w-9" onClick={handleEditCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">
                    {formatCurrency(Number(category.monthly_budget), currency)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => handleEditStart(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Categories with transactions cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {error && !isAddOpen && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg">
          {error}
          <Button variant="ghost" size="icon" className="ml-2 h-6 w-6" onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}