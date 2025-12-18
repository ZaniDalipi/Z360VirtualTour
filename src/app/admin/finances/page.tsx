'use client'

import { useState, useEffect } from 'react'
import {
  DollarSign, TrendingUp, TrendingDown, PiggyBank, Receipt, Plus,
  Calendar, Filter, Download, X, Check, ChevronDown, ChevronUp,
  Trash2, Edit2, Tag, Wallet, ArrowUpRight, ArrowDownRight,
  BarChart3, PieChart, Clock, CreditCard, Building2
} from 'lucide-react'
import { Card, Button, Input } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'

interface ExpenseCategory {
  id: string
  name: string
  description: string | null
  color: string
  icon: string
}

interface Expense {
  id: string
  description: string
  amount: number
  date: string
  categoryId: string
  category: ExpenseCategory
  vendor: string | null
  notes: string | null
  isRecurring: boolean
}

interface FinancialStats {
  period: string
  summary: {
    totalIncome: number
    totalExpenses: number
    netProfit: number
    profitMargin: string | number
    pendingIncome: number
    collectedDeposits: number
    completedBookingsCount: number
    avgBookingValue: number
  }
  expensesByCategory: Record<string, number>
  monthlyIncome: Array<{ month: string; income: number; expenses: number }>
  recentTransactions: {
    expenses: Array<{
      id: string
      type: string
      description: string
      amount: number
      date: string
      category: string
    }>
    income: Array<{
      id: string
      type: string
      description: string
      amount: number
      date: string
    }>
  }
}

const defaultCategories = [
  { name: 'Travel', color: '#3B82F6', icon: 'Car' },
  { name: 'Equipment', color: '#10B981', icon: 'Camera' },
  { name: 'Software', color: '#8B5CF6', icon: 'Laptop' },
  { name: 'Marketing', color: '#F59E0B', icon: 'Megaphone' },
  { name: 'Office', color: '#EC4899', icon: 'Building2' },
  { name: 'Other', color: '#6B7280', icon: 'Tag' },
]

export default function FinancesAdminPage() {
  const [stats, setStats] = useState<FinancialStats | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    vendor: '',
    notes: '',
    isRecurring: false,
  })

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    color: '#6B7280',
  })

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [statsRes, expensesRes, categoriesRes] = await Promise.all([
        fetch(`/api/admin/finances?period=${period}`),
        fetch('/api/admin/expenses'),
        fetch('/api/admin/expense-categories'),
      ])

      if (statsRes.ok) {
        setStats(await statsRes.json())
      }

      if (expensesRes.ok) {
        setExpenses(await expensesRes.json())
      }

      if (categoriesRes.ok) {
        const cats = await categoriesRes.json()
        setCategories(cats)
        // Set default category
        if (cats.length > 0 && !expenseForm.categoryId) {
          setExpenseForm(prev => ({ ...prev, categoryId: cats[0].id }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingExpense
        ? `/api/admin/expenses/${editingExpense.id}`
        : '/api/admin/expenses'

      const res = await fetch(url, {
        method: editingExpense ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseForm),
      })

      if (res.ok) {
        fetchData()
        resetExpenseForm()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to save expense')
      }
    } catch (error) {
      console.error('Failed to save expense:', error)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Delete this expense?')) return

    try {
      await fetch(`/api/admin/expenses/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Failed to delete expense:', error)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('/api/admin/expense-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      })

      if (res.ok) {
        fetchData()
        setShowCategoryForm(false)
        setCategoryForm({ name: '', description: '', color: '#6B7280' })
      }
    } catch (error) {
      console.error('Failed to create category:', error)
    }
  }

  const resetExpenseForm = () => {
    setExpenseForm({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      categoryId: categories[0]?.id || '',
      vendor: '',
      notes: '',
      isRecurring: false,
    })
    setEditingExpense(null)
    setShowExpenseForm(false)
  }

  const editExpense = (expense: Expense) => {
    setExpenseForm({
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date.split('T')[0],
      categoryId: expense.categoryId,
      vendor: expense.vendor || '',
      notes: expense.notes || '',
      isRecurring: expense.isRecurring,
    })
    setEditingExpense(expense)
    setShowExpenseForm(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Calculate max value for chart scaling
  const maxChartValue = stats?.monthlyIncome
    ? Math.max(...stats.monthlyIncome.map(m => Math.max(m.income, m.expenses)))
    : 0

  if (isLoading && !stats) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gold/10 rounded animate-pulse" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gold/10 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-bold text-cream">Finances</h1>
          <p className="text-body text-cream-muted">
            Track your income, expenses, and profitability
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 rounded-lg bg-navy-medium border border-gold/20 text-cream text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
          <Button onClick={() => setShowExpenseForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-cream-muted">Total Income</p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {formatCurrency(stats?.summary.totalIncome || 0)}
              </p>
              <p className="text-xs text-cream-muted mt-1">
                {stats?.summary.completedBookingsCount || 0} completed bookings
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </Card>

        {/* Total Expenses */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-cream-muted">Total Expenses</p>
              <p className="text-2xl font-bold text-red-400 mt-1">
                {formatCurrency(stats?.summary.totalExpenses || 0)}
              </p>
              <p className="text-xs text-cream-muted mt-1">
                {expenses.length} expenses recorded
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
          </div>
        </Card>

        {/* Net Profit */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-cream-muted">Net Profit</p>
              <p className={`text-2xl font-bold mt-1 ${
                (stats?.summary.netProfit || 0) >= 0 ? 'text-gold' : 'text-red-400'
              }`}>
                {formatCurrency(stats?.summary.netProfit || 0)}
              </p>
              <p className="text-xs text-cream-muted mt-1">
                {stats?.summary.profitMargin}% margin
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-gold" />
            </div>
          </div>
        </Card>

        {/* Pending Income */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-cream-muted">Pending Income</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">
                {formatCurrency(stats?.summary.pendingIncome || 0)}
              </p>
              <p className="text-xs text-cream-muted mt-1">
                {formatCurrency(stats?.summary.collectedDeposits || 0)} deposits collected
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly Trend Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-cream flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gold" />
              Monthly Trend
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-cream-muted">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-cream-muted">Expenses</span>
              </div>
            </div>
          </div>
          <div className="flex items-end justify-between h-48 gap-2">
            {stats?.monthlyIncome.map((month, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="flex items-end gap-1 h-40 w-full">
                  {/* Income bar */}
                  <div
                    className="flex-1 bg-green-400/80 rounded-t transition-all duration-500"
                    style={{
                      height: maxChartValue > 0
                        ? `${(month.income / maxChartValue) * 100}%`
                        : '0%',
                      minHeight: month.income > 0 ? '4px' : '0',
                    }}
                    title={`Income: ${formatCurrency(month.income)}`}
                  />
                  {/* Expense bar */}
                  <div
                    className="flex-1 bg-red-400/80 rounded-t transition-all duration-500"
                    style={{
                      height: maxChartValue > 0
                        ? `${(month.expenses / maxChartValue) * 100}%`
                        : '0%',
                      minHeight: month.expenses > 0 ? '4px' : '0',
                    }}
                    title={`Expenses: ${formatCurrency(month.expenses)}`}
                  />
                </div>
                <span className="text-xs text-cream-muted">{month.month}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Expenses by Category */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-cream flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-gold" />
            Expenses by Category
          </h3>
          <div className="space-y-3">
            {stats?.expensesByCategory && Object.entries(stats.expensesByCategory).length > 0 ? (
              Object.entries(stats.expensesByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => {
                  const cat = categories.find(c => c.name === category)
                  const percentage = stats.summary.totalExpenses > 0
                    ? ((amount / stats.summary.totalExpenses) * 100).toFixed(1)
                    : 0
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-cream">{category}</span>
                        <span className="text-sm text-cream-muted">
                          {formatCurrency(amount)} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-navy rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: cat?.color || '#6B7280',
                          }}
                        />
                      </div>
                    </div>
                  )
                })
            ) : (
              <p className="text-sm text-cream-muted text-center py-4">
                No expenses recorded for this period
              </p>
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="w-full mt-4"
            onClick={() => setShowCategoryForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-cream flex items-center gap-2">
            <Receipt className="w-5 h-5 text-gold" />
            Recent Expenses
          </h3>
        </div>

        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="w-12 h-12 text-cream-muted mx-auto mb-4" />
            <p className="text-cream-muted">No expenses recorded yet</p>
            <Button
              onClick={() => setShowExpenseForm(true)}
              className="mt-4"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Expense
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.slice(0, 10).map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 rounded-lg bg-navy hover:bg-navy-medium/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${expense.category.color}20` }}
                  >
                    <Tag className="w-5 h-5" style={{ color: expense.category.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-cream">{expense.description}</p>
                    <div className="flex items-center gap-2 text-xs text-cream-muted">
                      <span>{expense.category.name}</span>
                      {expense.vendor && (
                        <>
                          <span>•</span>
                          <span>{expense.vendor}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{formatDate(expense.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-red-400 font-semibold">
                    -{formatCurrency(expense.amount)}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => editExpense(expense)}
                      className="p-1.5 rounded-lg text-cream-muted hover:text-cream hover:bg-gold/10 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="p-1.5 rounded-lg text-cream-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add/Edit Expense Modal */}
      <AnimatePresence>
        {showExpenseForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={resetExpenseForm}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-lg pointer-events-auto"
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-h3 font-semibold text-cream">
                      {editingExpense ? 'Edit Expense' : 'Add Expense'}
                    </h2>
                    <button
                      onClick={resetExpenseForm}
                      className="p-2 rounded-lg text-cream-muted hover:text-cream hover:bg-gold/10"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateExpense} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Description *
                      </label>
                      <Input
                        value={expenseForm.description}
                        onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                        placeholder="What was this expense for?"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-cream mb-2">
                          Amount (€) *
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={expenseForm.amount}
                          onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cream mb-2">
                          Date *
                        </label>
                        <Input
                          type="date"
                          value={expenseForm.date}
                          onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Category *
                      </label>
                      <select
                        value={expenseForm.categoryId}
                        onChange={(e) => setExpenseForm({ ...expenseForm, categoryId: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-navy border border-gold/20 text-cream
                                   focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50"
                        required
                      >
                        <option value="">Select category...</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Vendor / Supplier
                      </label>
                      <Input
                        value={expenseForm.vendor}
                        onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                        placeholder="Who was paid?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Notes
                      </label>
                      <textarea
                        value={expenseForm.notes}
                        onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                        placeholder="Additional notes..."
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl bg-navy border border-gold/20 text-cream
                                   placeholder:text-cream-muted focus:outline-none focus:ring-2
                                   focus:ring-gold/50 focus:border-gold/50 resize-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="flex-1">
                        {editingExpense ? 'Update Expense' : 'Add Expense'}
                      </Button>
                      <Button type="button" variant="secondary" onClick={resetExpenseForm}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Add Category Modal */}
      <AnimatePresence>
        {showCategoryForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowCategoryForm(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md pointer-events-auto"
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-h3 font-semibold text-cream">Add Category</h2>
                    <button
                      onClick={() => setShowCategoryForm(false)}
                      className="p-2 rounded-lg text-cream-muted hover:text-cream hover:bg-gold/10"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateCategory} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Category Name *
                      </label>
                      <Input
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        placeholder="e.g., Travel, Equipment"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Description
                      </label>
                      <Input
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        placeholder="What types of expenses?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Color
                      </label>
                      <div className="flex gap-2">
                        {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#6B7280'].map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setCategoryForm({ ...categoryForm, color })}
                            className={`w-8 h-8 rounded-lg transition-all ${
                              categoryForm.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-navy-dark' : ''
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="flex-1">
                        Create Category
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => setShowCategoryForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
