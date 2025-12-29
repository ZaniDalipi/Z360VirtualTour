'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Trash2, Edit2, Loader2, User, Mail, Calendar,
  Eye, EyeOff, X, Check
} from 'lucide-react'
import { Card, Button, Input } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'

interface Admin {
  id: string
  email: string
  name: string
  createdAt: string
}

export default function AdminManagementPage() {
  const router = useRouter()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null)

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    loadAdmins()
    loadCurrentAdmin()
  }, [])

  async function loadCurrentAdmin() {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setCurrentAdminId(data.admin?.id || null)
      }
    } catch (error) {
      console.error('Failed to load current admin:', error)
    }
  }

  async function loadAdmins() {
    try {
      const res = await fetch('/api/admin/admins')
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Failed to fetch admins')
      }
      const data = await res.json()
      setAdmins(data.admins)
    } catch (error) {
      console.error('Failed to load admins:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreateError('')
    setCreateLoading(true)

    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })

      const data = await res.json()

      if (!res.ok) {
        setCreateError(data.error || 'Failed to create admin')
        return
      }

      setAdmins([data.admin, ...admins])
      setShowCreateModal(false)
      setCreateForm({ name: '', email: '', password: '' })
    } catch {
      setCreateError('Something went wrong')
    } finally {
      setCreateLoading(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/admins/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Failed to delete admin')
        return
      }

      setAdmins(admins.filter(a => a.id !== id))
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete admin:', error)
      alert('Failed to delete admin')
    } finally {
      setDeleteLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-bold text-cream">Admin Users</h1>
          <p className="text-body text-cream-muted mt-1">
            Manage administrator accounts
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Admin
        </Button>
      </div>

      {/* Admin List */}
      <Card className="divide-y divide-gold/10">
        {admins.length === 0 ? (
          <div className="p-8 text-center text-cream-muted">
            No admin users found
          </div>
        ) : (
          admins.map((admin) => (
            <div
              key={admin.id}
              className="p-4 flex items-center justify-between hover:bg-gold/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-body font-medium text-cream">{admin.name}</h3>
                    {admin.id === currentAdminId && (
                      <span className="px-2 py-0.5 bg-gold/20 text-gold text-caption rounded">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-body-sm text-cream-muted">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {admin.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Added {formatDate(admin.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {deleteConfirm === admin.id ? (
                  <>
                    <span className="text-body-sm text-cream-muted mr-2">Delete?</span>
                    <Button
                      variant="icon"
                      size="sm"
                      onClick={() => handleDelete(admin.id)}
                      disabled={deleteLoading}
                      className="text-red-400 hover:bg-red-500/20"
                    >
                      {deleteLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="icon"
                      size="sm"
                      onClick={() => setDeleteConfirm(null)}
                      disabled={deleteLoading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="icon"
                    size="sm"
                    onClick={() => setDeleteConfirm(admin.id)}
                    disabled={admin.id === currentAdminId}
                    className={admin.id === currentAdminId ? 'opacity-50 cursor-not-allowed' : 'text-red-400 hover:bg-red-500/20'}
                    title={admin.id === currentAdminId ? 'Cannot delete yourself' : 'Delete admin'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </Card>

      {/* Create Admin Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-h4 font-semibold text-cream">Add New Admin</h2>
                  <Button
                    variant="icon"
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {createError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4">
                    {createError}
                  </div>
                )}

                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-body-sm text-cream-muted mb-2">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-body-sm text-cream-muted mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      placeholder="admin@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-body-sm text-cream-muted mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={createForm.password}
                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                        placeholder="Min. 8 characters"
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-muted hover:text-cream"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createLoading}
                      className="flex-1"
                    >
                      {createLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        'Create Admin'
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
