"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Settings, Mic, MicOff, TrendingUp, DollarSign, Calendar, PieChart, Receipt, Wallet } from "lucide-react"
import { AddExpenseModal } from "./components/add-expense-modal"
import { ExpenseList } from "./components/expense-list"
import { BudgetTracker } from "./components/budget-tracker"
import { SettingsModal } from "./components/settings-modal"

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

interface Budget {
  category: string
  limit: number
  spent: number
  currency: string
}

interface AppSettings {
  defaultCurrency: string
  budgetAlerts: boolean
  offlineMode: boolean
  voiceInput: boolean
  categories: string[]
  currencies: string[]
}

const defaultCategories = [
  "Transportation",
  "Accommodation",
  "Food & Dining",
  "Religious Donations",
  "Souvenirs & Gifts",
  "Medical",
  "Communication",
  "Activities",
  "Other",
]

const defaultCurrencies = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "INR", "SGD"]

export default function ExpenseManager() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [settings, setSettings] = useState<AppSettings>({
    defaultCurrency: "USD",
    budgetAlerts: true,
    offlineMode: true,
    voiceInput: true,
    categories: defaultCategories,
    currencies: defaultCurrencies,
  })

  // Load data from localStorage on mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem("spiritual-expenses")
    const savedBudgets = localStorage.getItem("spiritual-budgets")
    const savedSettings = localStorage.getItem("spiritual-settings")

    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses))
    }
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets))
    }
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) })
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("spiritual-expenses", JSON.stringify(expenses))
  }, [expenses])

  useEffect(() => {
    localStorage.setItem("spiritual-budgets", JSON.stringify(budgets))
  }, [budgets])

  useEffect(() => {
    localStorage.setItem("spiritual-settings", JSON.stringify(settings))
  }, [settings])

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
    }
    setExpenses((prev) => [newExpense, ...prev])
  }

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id))
  }

  const updateBudget = (budget: Budget) => {
    setBudgets((prev) => {
      const existing = prev.find((b) => b.category === budget.category)
      if (existing) {
        return prev.map((b) => (b.category === budget.category ? budget : b))
      }
      return [...prev, budget]
    })
  }

  const toggleVoiceInput = () => {
    if (!settings.voiceInput) return

    setIsListening(!isListening)
    // Voice input implementation would go here
    if (!isListening) {
      // Start voice recognition
      console.log("Starting voice input...")
    } else {
      // Stop voice recognition
      console.log("Stopping voice input...")
    }
  }

  // Calculate statistics
  const totalExpenses = expenses.reduce((sum, exp) => {
    // Convert to default currency (simplified)
    return sum + exp.amount
  }, 0)

  const todayExpenses = expenses
    .filter((exp) => {
      const today = new Date().toDateString()
      return new Date(exp.date).toDateString() === today
    })
    .reduce((sum, exp) => sum + exp.amount, 0)

  const categoryTotals = expenses.reduce(
    (acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const topCategory = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Mobile-First Container */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-200 mb-4 sm:mb-6">
          <div className="flex items-center justify-between py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">Spiritual Journey</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Expense Manager</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {settings.voiceInput && (
                <Button
                  variant={isListening ? "default" : "outline"}
                  size="sm"
                  onClick={toggleVoiceInput}
                  className="w-8 h-8 sm:w-9 sm:h-9 p-0"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
                className="w-8 h-8 sm:w-9 sm:h-9 p-0"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pb-20 sm:pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Navigation */}
            <TabsList className="grid w-full grid-cols-4 mb-4 sm:mb-6 h-12 sm:h-14">
              <TabsTrigger
                value="dashboard"
                className="text-xs sm:text-sm flex flex-col sm:flex-row items-center gap-1"
              >
                <PieChart className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Home</span>
              </TabsTrigger>
              <TabsTrigger value="expenses" className="text-xs sm:text-sm flex flex-col sm:flex-row items-center gap-1">
                <Receipt className="w-4 h-4" />
                <span>Expenses</span>
              </TabsTrigger>
              <TabsTrigger value="budget" className="text-xs sm:text-sm flex flex-col sm:flex-row items-center gap-1">
                <Wallet className="w-4 h-4" />
                <span>Budget</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="text-xs sm:text-sm flex flex-col sm:flex-row items-center gap-1"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm opacity-90">Total Spent</p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
                      </div>
                      <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm opacity-90">Today</p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold">${todayExpenses.toFixed(2)}</p>
                      </div>
                      <Calendar className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm opacity-90">Expenses</p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold">{expenses.length}</p>
                      </div>
                      <Receipt className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm opacity-90">Top Category</p>
                        <p className="text-sm sm:text-base lg:text-lg font-bold truncate">
                          {topCategory?.[0] || "None"}
                        </p>
                      </div>
                      <PieChart className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Category Breakdown */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl">Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {Object.entries(categoryTotals).map(([category, amount]) => (
                      <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium truncate flex-1">{category}</span>
                        <Badge variant="secondary" className="ml-2">
                          ${amount.toFixed(2)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Expenses */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl">Recent Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {expenses.slice(0, 5).map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{expense.description}</p>
                          <p className="text-sm text-gray-600">{expense.category}</p>
                        </div>
                        <div className="text-right ml-3">
                          <p className="font-bold">${expense.amount.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Expenses Tab */}
            <TabsContent value="expenses">
              <ExpenseList expenses={expenses} onDeleteExpense={deleteExpense} settings={settings} />
            </TabsContent>

            {/* Budget Tab */}
            <TabsContent value="budget">
              <BudgetTracker budgets={budgets} expenses={expenses} onUpdateBudget={updateBudget} settings={settings} />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Spending Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 sm:py-12">
                    <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Analytics features coming soon!</p>
                    <p className="text-sm text-gray-500 mt-2">Charts and detailed insights will be available here.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        {/* Floating Action Button */}
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="lg"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-6 h-6 sm:w-7 sm:h-7" />
          </Button>
        </div>
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddExpense={addExpense}
        settings={settings}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />
    </div>
  )
}
