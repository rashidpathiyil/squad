import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getConfidenceLevel(score: number): 'low' | 'medium' | 'high' {
  if (score < 50) return 'low'
  if (score < 75) return 'medium'
  return 'high'
}

export function getConfidenceColor(score: number): string {
  const level = getConfidenceLevel(score)
  switch (level) {
    case 'low': return 'text-red-600 bg-red-50 border-red-200'
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'high': return 'text-green-600 bg-green-50 border-green-200'
  }
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
} 
