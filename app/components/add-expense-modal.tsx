"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Upload, MapPin, Calendar, DollarSign } from "lucide-react"

interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onAddExpense: (expense: {
    amount: number
    currency: string
    category: string
    description: string
    date: string
    location?: string
    receipt?: string
    paymentMethod: string
  }) => void
  settings: {
    defaultCurrency: string
    categories: string[]
    currencies: string[]
  }
}

export function AddExpenseModal({ isOpen, onClose, onAddExpense, settings }: AddExpenseModalProps) {
  const [formData, setFormData] = useState({
    amount: "",
    currency: settings.defaultCurrency,
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    location: "",
    paymentMethod: "cash",
  })
  const [receipt, setReceipt] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.amount || !formData.category || !formData.description) {
      return
    }

    onAddExpense({
      amount: Number.parseFloat(formData.amount),
      currency: formData.currency,
      category: formData.category,
      description: formData.description,
      date: formData.date,
      location: formData.location,
      receipt: receipt || undefined,
      paymentMethod: formData.paymentMethod,
    })

    // Reset form
    setFormData({
      amount: "",
      currency: settings.defaultCurrency,
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      location: "",
      paymentMethod: "cash",
    })
    setReceipt(null)
    onClose()
  }

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setReceipt(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = () => {
    // In a real app, this would open the camera
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.capture = "environment"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setReceipt(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Add New Expense</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount and Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="amount" className="text-sm font-medium">
                Amount *
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="currency" className="text-sm font-medium">
                Currency
              </Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
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

          {/* Category */}
          <div>
            <Label htmlFor="category" className="text-sm font-medium">
              Category *
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
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

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Description *
            </Label>
            <Textarea
              id="description"
              placeholder="What did you spend on?"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="resize-none"
              rows={2}
              required
            />
          </div>

          {/* Date and Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date" className="text-sm font-medium">
                Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="text-sm font-medium">
                Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="location"
                  placeholder="Optional"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <Label htmlFor="paymentMethod" className="text-sm font-medium">
              Payment Method
            </Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="digital">Digital Wallet</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Receipt Upload */}
          <div>
            <Label className="text-sm font-medium">Receipt (Optional)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCameraCapture}
                className="flex items-center gap-2 bg-transparent"
              >
                <Camera className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Camera</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("receipt-upload")?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Upload</span>
              </Button>
            </div>

            <input id="receipt-upload" type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />

            {receipt && (
              <Card className="mt-3">
                <CardContent className="p-3">
                  <img src={receipt || "/placeholder.svg"} alt="Receipt" className="w-full h-32 object-cover rounded" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setReceipt(null)}
                    className="mt-2 w-full"
                  >
                    Remove Receipt
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
            >
              Add Expense
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
