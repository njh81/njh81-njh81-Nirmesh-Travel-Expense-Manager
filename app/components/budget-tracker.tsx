"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertTriangle, Plus, Target, TrendingUp, TrendingDown } from "lucide-react"

interface Budget {
  category: string
  limit: number
  spent: number
  currency: string
}

interface Expense {
  id: string
  amount: number
  currency: string
  category: string
  description: string
  date: string
  location?: string
  receipt?: string
  paymentMethod: string
}

interface BudgetTrackerProps {
  budgets: Budget[]
  expenses: Expense[]
  onUpdateBudget: (budget: Budget) => void
  settings: {
    categories: string[]
    currencies: string[]
    defaultCurrency: string
  }
}

export function BudgetTracker({ budgets, expenses, onUpdateBudget, settings }: BudgetTrackerProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newBudget, setNewBudget] = useState({
    category: "",
    limit: "",
    currency: settings.defaultCurrency,
  })

  // Calculate spent amounts for each category
  const categorySpending = expenses.reduce(
    (acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0
      }
      // Simple currency conversion (in real app, use actual rates)
      acc[expense.category] += expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  // Update budgets with current spending
  const updatedBudgets = budgets.map((budget) => ({
    ...budget,
    spent: categorySpending[budget.category] || 0,
  }))

  const handleAddBudget = () => {
    if (!newBudget.category || !newBudget.limit) return

    const budget: Budget = {
      category: newBudget.category,
      limit: Number.parseFloat(newBudget.limit),
      spent: categorySpending[newBudget.category] || 0,
      currency: newBudget.currency,
    }

    onUpdateBudget(budget)
    setNewBudget({
      category: "",
      limit: "",
      currency: settings.defaultCurrency,
    })
    setIsAddModalOpen(false)
  }

  const getProgressColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100
    if (percentage >= 100) return "bg-red-500"
    if (percentage >= 80) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStatusBadge = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100
    if (percentage >= 100) {
      return <Badge variant="destructive">Over Budget</Badge>
    }
    if (percentage >= 80) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Near Limit
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        On Track
      </Badge>
    )
  }

  const totalBudget = updatedBudgets.reduce((sum, budget) => sum + budget.limit, 0)
  const totalSpent = updatedBudgets.reduce((sum, budget) => sum + budget.spent, 0)
  const overBudgetCount = updatedBudgets.filter((budget) => budget.spent > budget.limit).length

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Budget</p>
                <p className="text-2xl font-bold">${totalBudget.toFixed(2)}</p>
              </div>
              <Target className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Spent</p>
                <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Remaining</p>
                <p className="text-2xl font-bold">${(totalBudget - totalSpent).toFixed(2)}</p>
              </div>
              <TrendingDown className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Budget Categories</h2>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Budget</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="budget-category">Category</Label>
                  <Select
                    value={newBudget.category}
                    onValueChange={(value) => setNewBudget((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="budget-limit">Budget Limit</Label>
                    <Input
                      id="budget-limit"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newBudget.limit}
                      onChange={(e) => setNewBudget((prev) => ({ ...prev, limit: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="budget-currency">Currency</Label>
                    <Select
                      value={newBudget.currency}
                      onValueChange={(value) => setNewBudget((prev) => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {settings.currencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleAddBudget} className="flex-1">
                    Add Budget
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {updatedBudgets.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No budgets set</p>
              <p className="text-sm text-gray-500 mt-1">Create your first budget to start tracking your spending</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {updatedBudgets.map((budget) => {
              const percentage = Math.min((budget.spent / budget.limit) * 100, 100)
              const isOverBudget = budget.spent > budget.limit

              return (
                <Card key={budget.category} className={isOverBudget ? "border-red-200 bg-red-50" : ""}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{budget.category}</h3>
                        {getStatusBadge(budget.spent, budget.limit)}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Spent: ${budget.spent.toFixed(2)}</span>
                          <span>Budget: ${budget.limit.toFixed(2)}</span>
                        </div>

                        <div className="relative">
                          <Progress value={percentage} className="h-3" />
                          {isOverBudget && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{percentage.toFixed(1)}% used</span>
                          <span>
                            {isOverBudget
                              ? `$${(budget.spent - budget.limit).toFixed(2)} over`
                              : `$${(budget.limit - budget.spent).toFixed(2)} remaining`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Alerts */}
      {overBudgetCount > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">Budget Alert</p>
                <p className="text-sm text-red-700">
                  You have {overBudgetCount} {overBudgetCount === 1 ? "category" : "categories"} over budget
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
