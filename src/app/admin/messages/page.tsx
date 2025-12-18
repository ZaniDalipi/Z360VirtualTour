'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, Building2, Calendar, Trash2, Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  service: string | null
  message: string
  isRead: boolean
  createdAt: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/admin/messages')
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRead = async (id: string, isRead: boolean) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !isRead }),
      })

      if (res.ok) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === id ? { ...msg, isRead: !isRead } : msg))
        )
      }
    } catch (error) {
      console.error('Failed to update message:', error)
    }
  }

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setMessages((prev) => prev.filter((msg) => msg.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete message:', error)
    }
  }

  const filteredMessages = messages.filter((msg) => {
    if (filter === 'unread') return !msg.isRead
    if (filter === 'read') return msg.isRead
    return true
  })

  const unreadCount = messages.filter((msg) => !msg.isRead).length

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gold/10 rounded animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gold/10 rounded-xl animate-pulse" />
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
          <h1 className="text-h2 font-bold text-cream">Messages</h1>
          <p className="text-body text-cream-muted">
            {unreadCount > 0
              ? `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`
              : 'All messages read'}
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {(['all', 'unread', 'read'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-gold text-navy'
                  : 'bg-navy-medium text-cream-muted hover:text-cream'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'unread' && unreadCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-navy">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <Card className="p-12 text-center">
          <Mail className="w-12 h-12 text-cream-muted mx-auto mb-4" />
          <p className="text-cream-muted">
            {filter === 'all'
              ? 'No messages yet'
              : filter === 'unread'
              ? 'No unread messages'
              : 'No read messages'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card
                  className={`overflow-hidden transition-colors ${
                    !message.isRead ? 'border-gold/40 bg-gold/5' : ''
                  }`}
                >
                  {/* Message Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-navy-medium/50 transition-colors"
                    onClick={() =>
                      setExpandedId(expandedId === message.id ? null : message.id)
                    }
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          {!message.isRead && (
                            <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
                          )}
                          <h3 className="font-semibold text-cream truncate">
                            {message.name}
                          </h3>
                          {message.service && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-navy-medium text-cream-muted">
                              {message.service}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-cream-muted truncate">
                          {message.message}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-cream-muted">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                        {expandedId === message.id ? (
                          <ChevronUp className="w-5 h-5 text-cream-muted" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-cream-muted" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedId === message.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-gold/10 pt-4">
                          {/* Contact Info */}
                          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-gold" />
                              <a
                                href={`mailto:${message.email}`}
                                className="text-cream hover:text-gold transition-colors"
                              >
                                {message.email}
                              </a>
                            </div>
                            {message.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-gold" />
                                <a
                                  href={`tel:${message.phone}`}
                                  className="text-cream hover:text-gold transition-colors"
                                >
                                  {message.phone}
                                </a>
                              </div>
                            )}
                            {message.company && (
                              <div className="flex items-center gap-2 text-sm">
                                <Building2 className="w-4 h-4 text-gold" />
                                <span className="text-cream">{message.company}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-gold" />
                              <span className="text-cream-muted">
                                {new Date(message.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Message Content */}
                          <div className="p-4 rounded-xl bg-navy mb-4">
                            <p className="text-cream whitespace-pre-wrap">
                              {message.message}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3">
                            <Button
                              variant="secondary"
                              onClick={() => toggleRead(message.id, message.isRead)}
                            >
                              {message.isRead ? (
                                <>
                                  <X className="w-4 h-4 mr-2" />
                                  Mark as Unread
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-2" />
                                  Mark as Read
                                </>
                              )}
                            </Button>
                            <a href={`mailto:${message.email}`}>
                              <Button variant="secondary">
                                <Mail className="w-4 h-4 mr-2" />
                                Reply
                              </Button>
                            </a>
                            <Button
                              variant="ghost"
                              onClick={() => deleteMessage(message.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
