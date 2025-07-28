"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, SettingsIcon, TrendingUp, Wallet, Receipt, BarChart3, Calendar, MapPin } from "lucide-react"
import { AddExpenseModal } from "./components/add-expense-modal"
import { ExpenseList } from "./components/expense-list"
import { BudgetTracker } from "./components/budget-tracker"
import { SettingsModal } from "./components/settings-modal"

export interface Expense {
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

const defaultSettings = {
  defaultCurrency: "USD",
  budget: 1000,
  categories: ["Food", "Transport", "Accommodation", "Religious Items", "Donations", "Souvenirs", "Medical", "Other"],
  budgetPeriod: "monthly",
}

export default function ExpenseManager() {
  const [expenses, setExpenses] = useState([])
  const [settings, setSettings] = useState(defaultSettings)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem("spiritual-expenses")
    const savedSettings = localStorage.getItem("spiritual-settings")

    if (savedExpenses) {
      try {
        setExpenses(JSON.parse(savedExpenses))
      } catch (error) {
        console.error("Error loading expenses:", error)
      }
    }

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    }
  }, [])

  // Save expenses to localStorage whenever expenses change
  useEffect(() => {
    localStorage.setItem("spiritual-expenses", JSON.stringify(expenses))
  }, [expenses])

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem("spiritual-settings", JSON.stringify(settings))
  }, [settings])

  const addExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
    }
    setExpenses((prev) => [newExpense, ...prev])
  }

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id))
  }

  const updateSettings = (newSettings) => {
    setSettings(newSettings)
  }

  const totalExpenses = expenses.reduce((sum, expense) => {
    // Convert to default currency (simplified - in real app, use exchange rates)
    return sum + expense.amount
  }, 0)

  const todayExpenses = expenses
    .filter((expense) => {
      const today = new Date().toDateString()
      const expenseDate = new Date(expense.date).toDateString()
      return today === expenseDate
    })
    .reduce((sum, expense) => sum + expense.amount, 0)

  const thisWeekExpenses = expenses
    .filter((expense) => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(expense.date) >= weekAgo
    })
    .reduce((sum, expense) => sum + expense.amount, 0)

  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {})

  const topCategory = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Spiritual Journey</h1>
              <p className="text-orange-100 text-sm">Expense Tracker</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => setIsSettingsModalOpen(true)}
          >
            <SettingsIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white shadow-sm">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center space-x-2">
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center space-x-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Budget</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-700">Today</p>
                      <p className="text-lg font-bold text-blue-900">
                        {settings.defaultCurrency} {todayExpenses.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-green-700">This Week</p>
                      <p className="text-lg font-bold text-green-900">
                        {settings.defaultCurrency} {thisWeekExpenses.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Total Expenses */}
            <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-orange-100 mb-2">Total Expenses</p>
                  <p className="text-3xl font-bold">
                    {settings.defaultCurrency} {totalExpenses.toFixed(2)}
                  </p>
                  <p className="text-orange-100 text-sm mt-2">{expenses.length} transactions</p>
                </div>
              </CardContent>
            </Card>

            {/* Top Category */}
            {topCategory && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Top Spending Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">{topCategory[0]}</p>
                      <p className="text-sm text-gray-600">
                        {((topCategory[1] / totalExpenses) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {settings.defaultCurrency} {topCategory[1].toFixed(2)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Expenses */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                {expenses.slice(0, 3).length > 0 ? (
                  <div className="space-y-3">
                    {expenses.slice(0, 3).map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{expense.description}</p>
                          <p className="text-sm text-gray-600">{expense.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {expense.currency} {expense.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No expenses yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseList
              expenses={expenses}
              onDeleteExpense={deleteExpense}
              defaultCurrency={settings.defaultCurrency}
            />
          </TabsContent>

          <TabsContent value="budget">
            <BudgetTracker
              expenses={expenses}
              budget={settings.budget}
              budgetPeriod={settings.budgetPeriod}
              defaultCurrency={settings.defaultCurrency}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={() => setIsAddModalOpen(true)}
          size="lg"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddExpense={addExpense}
        categories={settings.categories}
        defaultCurrency={settings.defaultCurrency}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />
    </div>
  )
}
