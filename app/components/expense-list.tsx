"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Search, Receipt, MapPin, CreditCard } from "lucide-react"
import type { Expense } from "../page"

interface ExpenseListProps {
  expenses: Expense[]
  onDeleteExpense: (id: string) => void
  defaultCurrency: string
}

export function ExpenseList({ expenses, onDeleteExpense, defaultCurrency }: ExpenseListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [sortBy, setSortBy] = useState("date")

  const categories = Array.from(new Set(expenses.map((expense) => expense.category)))

  const filteredAndSortedExpenses = expenses
    .filter((expense) => {
      const matchesSearch =
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === "all" || expense.category === filterCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "amount":
          return b.amount - a.amount
        case "category":
          return a.category.localeCompare(b.category)
        case "date":
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
    })

  const totalFiltered = filteredAndSortedExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="amount">Sort by Amount</SelectItem>
                  <SelectItem value="category">Sort by Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary */}
          {filteredAndSortedExpenses.length > 0 && (
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-gray-600">
                {filteredAndSortedExpenses.length} expense{filteredAndSortedExpenses.length !== 1 ? "s" : ""}
              </span>
              <span className="font-semibold">
                Total: {defaultCurrency} {totalFiltered.toFixed(2)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense List */}
      {filteredAndSortedExpenses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Receipt className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500">
              {expenses.length === 0 ? "No expenses yet" : "No expenses match your search"}
            </p>
            {expenses.length === 0 && (
              <p className="text-sm text-gray-400 mt-2">Tap the + button to add your first expense</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedExpenses.map((expense) => (
            <Card key={expense.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {expense.category}
                      </Badge>
                      <span className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{expense.description}</h3>

                    <div className="space-y-1">
                      {expense.location && (
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate">{expense.location}</span>
                        </div>
                      )}

                      <div className="flex items-center text-xs text-gray-500">
                        <CreditCard className="w-3 h-3 mr-1" />
                        <span>{expense.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 ml-4">
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900">
                        {expense.currency} {expense.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(expense.date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteExpense(expense.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {expense.receipt && (
                  <div className="mt-3 pt-3 border-t">
                    <img
                      src={expense.receipt || "/placeholder.svg"}
                      alt="Receipt"
                      className="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-80"
                      onClick={() => window.open(expense.receipt, "_blank")}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
