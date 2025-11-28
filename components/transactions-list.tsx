"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { deleteTransaction } from "@/lib/data-actions"
import type { Category, Transaction } from "@/lib/types"
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Receipt,
} from "lucide-react"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatMonth(month: string) {
  const [year, monthNum] = month.split("-")
  const date = new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1)
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function getAvailableMonths() {
  const months: string[] = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(date.toISOString().slice(0, 7))
  }
  return months
}

export function TransactionsList({
  transactions,
  categories,
  currentMonth,
}: {
  transactions: Transaction[]
  categories: Category[]
  currentMonth: string
}) {
  const router = useRouter()
  const availableMonths = getAvailableMonths()

  const [searchQuery, setSearchQuery] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleMonthChange = (month: string) => {
    router.push(`/transactions?month=${month}`)
  }

  const goToPreviousMonth = () => {
    const currentIndex = availableMonths.indexOf(currentMonth)
    if (currentIndex < availableMonths.length - 1) {
      handleMonthChange(availableMonths[currentIndex + 1])
    }
  }

  const goToNextMonth = () => {
    const currentIndex = availableMonths.indexOf(currentMonth)
    if (currentIndex > 0) {
      handleMonthChange(availableMonths[currentIndex - 1])
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    await deleteTransaction(deleteId)
    setDeleteId(null)
    setIsDeleting(false)
  }

  const filteredTransactions = transactions.filter((t) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      t.category_name?.toLowerCase().includes(query) ||
      t.notes?.toLowerCase().includes(query) ||
      t.amount.toString().includes(query)
    )
  })

  const totalSpent = filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground">View and manage your spending for {formatMonth(currentMonth)}</p>
        </div>

        <Link href="/transactions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </Link>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Month Selector */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousMonth}
                disabled={availableMonths.indexOf(currentMonth) >= availableMonths.length - 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Select value={currentMonth} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map((month) => (
                    <SelectItem key={month} value={month}>
                      {formatMonth(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextMonth}
                disabled={availableMonths.indexOf(currentMonth) <= 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Summary */}
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Transaction History
          </CardTitle>
          <CardDescription>
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">No transactions found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search query" : "Start by adding your first transaction"}
              </p>
              {!searchQuery && (
                <Link href="/transactions/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Transaction
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{formatDate(transaction.date)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{transaction.category_name}</span>
                          {transaction.is_recurring && (
                            <Badge variant="secondary" className="text-xs">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Recurring
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">
                        {transaction.notes || "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(transaction.amount))}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/transactions/${transaction.id}/edit`}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteId(transaction.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The transaction will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
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
    </div>
  )
}
