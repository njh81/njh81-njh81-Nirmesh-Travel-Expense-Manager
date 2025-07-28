"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, X, Globe, Bell, Palette, Database } from "lucide-react"

interface Settings {
  defaultCurrency: string
  budgetAlerts: boolean
  offlineMode: boolean
  voiceInput: boolean
  categories: string[]
  currencies: string[]
}

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: Settings
  onUpdateSettings: (settings: Settings) => void
}

export function SettingsModal({ isOpen, onClose, settings, onUpdateSettings }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<Settings>(settings)
  const [newCategory, setNewCategory] = useState("")
  const [newCurrency, setNewCurrency] = useState("")

  const handleSave = () => {
    onUpdateSettings(localSettings)
    onClose()
  }

  const addCategory = () => {
    if (newCategory.trim() && !localSettings.categories.includes(newCategory.trim())) {
      setLocalSettings((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()],
      }))
      setNewCategory("")
    }
  }

  const removeCategory = (category: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== category),
    }))
  }

  const addCurrency = () => {
    if (newCurrency.trim() && !localSettings.currencies.includes(newCurrency.trim().toUpperCase())) {
      setLocalSettings((prev) => ({
        ...prev,
        currencies: [...prev.currencies, newCurrency.trim().toUpperCase()],
      }))
      setNewCurrency("")
    }
  }

  const removeCurrency = (currency: string) => {
    if (localSettings.currencies.length > 1 && currency !== localSettings.defaultCurrency) {
      setLocalSettings((prev) => ({
        ...prev,
        currencies: prev.currencies.filter((c) => c !== currency),
      }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="w-5 h-5" />
                General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="default-currency">Default Currency</Label>
                <Select
                  value={localSettings.defaultCurrency}
                  onValueChange={(value) => setLocalSettings((prev) => ({ ...prev, defaultCurrency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {localSettings.currencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="budget-alerts">Budget Alerts</Label>
                  <p className="text-sm text-gray-600">Get notified when approaching budget limits</p>
                </div>
                <Switch
                  id="budget-alerts"
                  checked={localSettings.budgetAlerts}
                  onCheckedChange={(checked) => setLocalSettings((prev) => ({ ...prev, budgetAlerts: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* App Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="w-5 h-5" />
                Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="offline-mode">Offline Mode</Label>
                  <p className="text-sm text-gray-600">Work without internet connection</p>
                </div>
                <Switch
                  id="offline-mode"
                  checked={localSettings.offlineMode}
                  onCheckedChange={(checked) => setLocalSettings((prev) => ({ ...prev, offlineMode: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="voice-input">Voice Input</Label>
                  <p className="text-sm text-gray-600">Add expenses using voice commands</p>
                </div>
                <Switch
                  id="voice-input"
                  checked={localSettings.voiceInput}
                  onCheckedChange={(checked) => setLocalSettings((prev) => ({ ...prev, voiceInput: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Database className="w-5 h-5" />
                Expense Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add new category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCategory()}
                />
                <Button onClick={addCategory} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {localSettings.categories.map((category) => (
                  <Badge key={category} variant="secondary" className="flex items-center gap-1">
                    {category}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-4 h-4 p-0 hover:bg-red-100"
                      onClick={() => removeCategory(category)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Currencies Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="w-5 h-5" />
                Supported Currencies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add currency code (e.g., EUR)"
                  value={newCurrency}
                  onChange={(e) => setNewCurrency(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCurrency()}
                />
                <Button onClick={addCurrency} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {localSettings.currencies.map((currency) => (
                  <Badge
                    key={currency}
                    variant={currency === localSettings.defaultCurrency ? "default" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    {currency}
                    {currency === localSettings.defaultCurrency && <span className="text-xs">(default)</span>}
                    {currency !== localSettings.defaultCurrency && localSettings.currencies.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-4 h-4 p-0 hover:bg-red-100"
                        onClick={() => removeCurrency(currency)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
