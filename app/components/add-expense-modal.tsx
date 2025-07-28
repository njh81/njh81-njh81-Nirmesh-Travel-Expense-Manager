"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Upload, Mic, MapPin } from "lucide-react"
import type { Expense } from "../page"

interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onAddExpense: (expense: Omit<Expense, "id">) => void
  categories: string[]
  defaultCurrency: string
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

const paymentMethods = ["Cash", "Credit Card", "Debit Card", "Digital Wallet", "Bank Transfer", "Other"]

export function AddExpenseModal({ isOpen, onClose, onAddExpense, categories, defaultCurrency }: AddExpenseModalProps) {
  const [formData, setFormData] = useState({
    amount: "",
    currency: defaultCurrency,
    category: "",
    description: "",
    location: "",
    paymentMethod: "Cash",
    receipt: "",
  })

  const [isListening, setIsListening] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.amount || !formData.category || !formData.description) {
      alert("Please fill in all required fields")
      return
    }

    const expense: Omit<Expense, "id"> = {
      amount: Number.parseFloat(formData.amount),
      currency: formData.currency,
      category: formData.category,
      description: formData.description,
      date: new Date().toISOString(),
      location: formData.location,
      receipt: formData.receipt,
      paymentMethod: formData.paymentMethod,
    }

    onAddExpense(expense)

    // Reset form
    setFormData({
      amount: "",
      currency: defaultCurrency,
      category: "",
      description: "",
      location: "",
      paymentMethod: "Cash",
      receipt: "",
    })

    onClose()
  }

  const handleVoiceInput = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "en-US"

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setFormData((prev) => ({ ...prev, description: transcript }))
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
        alert("Voice recognition failed. Please try again.")
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } else {
      alert("Voice recognition is not supported in your browser")
    }
  }

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData((prev) => ({ ...prev, receipt: event.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.capture = "environment"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          setFormData((prev) => ({ ...prev, receipt: event.target?.result as string }))
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setFormData((prev) => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          }))
        },
        () => {
          alert("Unable to get location. Please enter manually.")
        },
      )
    } else {
      alert("Geolocation is not supported in your browser")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Add New Expense</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount and Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                className="text-lg"
                required
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
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
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description with Voice Input */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <div className="flex space-x-2">
              <Textarea
                id="description"
                placeholder="What did you spend on?"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="flex-1"
                rows={2}
                required
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleVoiceInput}
                className={`shrink-0 ${isListening ? "bg-red-100 text-red-600" : ""}`}
                title="Voice input"
              >
                <Mic className={`w-4 h-4 ${isListening ? "animate-pulse" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Location</Label>
            <div className="flex space-x-2">
              <Input
                id="location"
                placeholder="Where was this expense?"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={getCurrentLocation}
                className="shrink-0 bg-transparent"
                title="Get current location"
              >
                <MapPin className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Receipt Upload */}
          <div>
            <Label>Receipt (Optional)</Label>
            <div className="flex space-x-2 mt-2">
              <Button type="button" variant="outline" onClick={handleCameraCapture} className="flex-1 bg-transparent">
                <Camera className="w-4 h-4 mr-2" />
                Camera
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("receipt-upload")?.click()}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
            <input id="receipt-upload" type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />
            {formData.receipt && (
              <div className="mt-2">
                <img
                  src={formData.receipt || "/placeholder.svg"}
                  alt="Receipt"
                  className="w-full h-32 object-cover rounded border"
                />
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              Add Expense
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
