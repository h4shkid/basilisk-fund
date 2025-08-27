import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00'
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function calculatePercentage(value: number | null | undefined, total: number | null | undefined): number {
  if (!value || !total || total === 0) return 0
  return (value / total) * 100
}

export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00%'
  }
  return `${value.toFixed(2)}%`
}

export function safeNumber(value: unknown): number {
  if (value === null || value === undefined || typeof value === 'undefined') {
    return 0
  }
  const num = Number(value)
  if (isNaN(num)) {
    return 0
  }
  return num
}