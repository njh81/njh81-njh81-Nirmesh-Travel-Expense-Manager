"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target } from "lucide-react"
import type { Expense } from "../page"

interface BudgetTrackerProps {
  expenses: Expense[]
  budget: number
  budgetPeriod: "daily" | "weekly" | "monthly"
  defaultCurrency: string
}

export function BudgetTracker({ expenses, budget, budgetPeriod, defaultCurrency }: BudgetTrackerProps) {
  const now = new Date()

  const getFilteredExpenses = () => {
    const startDate = new Date()

    switch (budgetPeriod) {
      case "daily":
        startDate.setHours(0, 0, 0, 0)
        break
      case "weekly":
        const dayOfWeek = startDate.getDay()
        startDate.setDate(startDate.getDate() - dayOfWeek)
        startDate.setHours(0, 0, 0, 0)
        break
      case "monthly":
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)
        break
    }

    return expenses.filter((expense) => new Date(expense.date) >= startDate)
  }

  const periodExpenses = getFilteredExpenses()
  const totalSpent = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const remaining = budget - totalSpent
  const percentageUsed = (totalSpent / budget) * 100

  const getStatusColor = () => {
    if (percentageUsed >= 100) return "text-red-600"
    if (percentageUsed >= 80) return "text-orange-600"
    if (percentageUsed >= 60) return "text-yellow-600"
    return "text-green-600"
  }

  const getStatusIcon = () => {
    if (percentageUsed >= 100) return <AlertTriangle className="w-5 h-5 text-red-600" />
    if (percentageUsed >= 80) return <TrendingUp className="w-5 h-5 text-orange-600" />
    return <CheckCircle className="w-5 h-5 text-green-600" />
  }

  const getStatusMessage = () => {
    if (percentageUsed >= 100) return "Budget exceeded!"
    if (percentageUsed >= 80) return "Approaching budget limit"
    if (percentageUsed >= 60) return "On track"
    return "Well within budget"
  }

  // Category breakdown
  const categoryTotals = periodExpenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Daily average (for weekly/monthly periods)
  const getDaysInPeriod = () => {
    switch (budgetPeriod) {
      case "daily":
        return 1
      case "weekly":
        return 7
      case "monthly":
        return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    }
  }

  const daysInPeriod = getDaysInPeriod()
  const dailyAverage = totalSpent / Math.min(daysInPeriod, now.getDate())
  const projectedSpending = dailyAverage * daysInPeriod

  return (
    <div className="space-y-4">
      {/* Budget Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span>Budget Overview</span>
            <Badge variant="outline" className="ml-auto">
              {budgetPeriod.charAt(0).toUpperCase() + budgetPeriod.slice(1)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Budget Usage</span>
              <span className={`text-sm font-bold ${getStatusColor()}`}>{percentageUsed.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(percentageUsed, 100)} className="h-3" />
          </div>

          {/* Budget Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {defaultCurrency} {totalSpent.toFixed(2)}
              </p>
              <p className="text-xs text-gray-600">Spent</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                {defaultCurrency} {Math.abs(remaining).toFixed(2)}
              </p>
              <p className="text-xs text-gray-600">{remaining >= 0 ? "Remaining" : "Over Budget"}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {defaultCurrency} {budget.toFixed(2)}
              </p>
              <p className="text-xs text-gray-600">Budget</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center space-x-2 p-3 bg-white rounded-lg">
            {getStatusIcon()}
            <span className={`font-medium ${getStatusColor()}`}>{getStatusMessage()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Spending Insights */}
      {budgetPeriod !== "daily" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Spending Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">
                  {defaultCurrency} {dailyAverage.toFixed(2)}
                </p>
                <p className="text-xs text-gray-600">Daily Average</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center space-x-1">
                  <p className="text-lg font-bold text-gray-900">
                    {defaultCurrency} {projectedSpending.toFixed(2)}
                  </p>
                  {projectedSpending > budget ? (
                    <TrendingUp className="w-4 h-4 text-red-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <p className="text-xs text-gray-600">Projected Total</p>
              </div>
            </div>

            {projectedSpending > budget && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  At current spending rate, you may exceed your budget by{" "}
                  <span className="font-semibold">
                    {defaultCurrency} {(projectedSpending - budget).toFixed(2)}
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown */}
      {sortedCategories.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedCategories.map(([category, amount]) => {
                const percentage = (amount / totalSpent) * 100
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{category}</span>
                      <div className="text-right">
                        <span className="text-sm font-bold">
                          {defaultCurrency} {amount.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      {periodExpenses.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Transactions ({periodExpenses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {periodExpenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{expense.description}</p>
                    <p className="text-xs text-gray-600">{expense.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {expense.currency} {expense.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
