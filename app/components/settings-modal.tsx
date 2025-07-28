"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, X, Palette, Database, Target } from "lucide-react"
import type { Settings } from "../page"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: Settings
  onUpdateSettings: (settings: Settings) => void
}

const currencies = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "AUD",
  "CAD",
  "CHF",
  "CNY",
  "INR",
  "KRW",
  "MXN",
  "BRL",
  "RUB",
  "ZAR",
  "SGD",
  "HKD",
  "NOK",
  "SEK",
  "DKK",
  "PLN",
]

const defaultCategories = [
  "Food",
  "Transport",
  "Accommodation",
  "Religious Items",
  "Donations",
  "Souvenirs",
  "Medical",
  "Entertainment",
  "Shopping",
  "Other",
]

export function SettingsModal({ isOpen, onClose, settings, onUpdateSettings }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<Settings>(settings)
  const [newCategory, setNewCategory] = useState("")

  const handleSave = () => {
    onUpdateSettings(localSettings)
    onClose()
  }

  const handleAddCategory = () => {
    if (newCategory.trim() && !localSettings.categories.includes(newCategory.trim())) {
      setLocalSettings((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()],
      }))
      setNewCategory("")
    }
  }

  const handleRemoveCategory = (categoryToRemove: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      categories: prev.categories.filter((cat) => cat !== categoryToRemove),
    }))
  }

  const handleResetCategories = () => {
    setLocalSettings((prev) => ({
      ...prev,
      categories: [...defaultCategories],
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Currency Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Palette className="w-4 h-4" />
                <span>Currency & Budget</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Select
                  value={localSettings.defaultCurrency}
                  onValueChange={(value) => setLocalSettings((prev) => ({ ...prev, defaultCurrency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="budget">Budget Amount</Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  value={localSettings.budget}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      budget: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="text-lg"
                />
              </div>

              <div>
                <Label htmlFor="budgetPeriod">Budget Period</Label>
                <Select
                  value={localSettings.budgetPeriod}
                  onValueChange={(value: "daily" | "weekly" | "monthly") =>
                    setLocalSettings((prev) => ({ ...prev, budgetPeriod: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Categories Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Expense Categories</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Category */}
              <div className="flex space-x-2">
                <Input
                  placeholder="Add new category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddCategory}
                  size="icon"
                  disabled={!newCategory.trim() || localSettings.categories.includes(newCategory.trim())}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Current Categories */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Current Categories ({localSettings.categories.length})</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetCategories}
                    className="text-xs bg-transparent"
                  >
                    Reset to Default
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded">
                  {localSettings.categories.map((category) => (
                    <Badge key={category} variant="secondary" className="flex items-center space-x-1 pr-1">
                      <span>{category}</span>
                      <button
                        onClick={() => handleRemoveCategory(category)}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Data Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600">
                <p>• Data is stored locally in your browser</p>
                <p>• Export functionality coming soon</p>
                <p>• Clear browser data will reset all expenses</p>
              </div>

              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  if (confirm("This will clear all your expense data. Are you sure?")) {
                    localStorage.removeItem("spiritual-expenses")
                    localStorage.removeItem("spiritual-settings")
                    window.location.reload()
                  }
                }}
              >
                Clear All Data
              </Button>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
