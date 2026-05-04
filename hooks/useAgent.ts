import { supabase } from '@/lib/supabase'
import { TMessage, TPendingToolCall } from '@/types/hooks/use-agent'
import type { TCategory } from '@/types/store/useCategory'
import { useState } from 'react'

export function useChat(categories: TCategory[]) {
  const [messages, setMessages] = useState<TMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [pendingToolCall, setPendingToolCall] = useState<TPendingToolCall | null>(null)

  const sendMessage = async (userText: string) => {
    if (loading || !userText.trim()) return

    const userMsg: TMessage = { role: 'user', content: userText.trim() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setLoading(true)
    setPendingToolCall(null) // clear any previous pending action

    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: {
        messages: updated,
        categories,
      },
    })

    if (error) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '⚠️ Something went wrong. Please try again.' },
      ])
      setLoading(false)
      return
    }

    // Show AI reply
    if (data.message) {
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    }

    console.log('AI response:', data)

    // If AI wants to write to DB, hold it for user confirmation
    if (data.pendingToolCall) {
      setPendingToolCall(data.pendingToolCall)
    }

    setLoading(false)
  }

  // ---- User taps Approve (with optional edited values) ----
  const confirmAction = async (overrides?: TPendingToolCall['args']) => {
    if (!pendingToolCall) return

    const { toolName } = pendingToolCall
    const args = overrides ?? pendingToolCall.args
    setLoading(true)

    if (toolName === 'addExpense') {
      const { error } = await supabase.from('expense').insert({
        name: args.name,
        amount: args.amount,
        category: args.category,
        is_expense: args.is_expense,
        spend_date: args.spend_date ?? new Date().toISOString(),
      })

      if (error) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `❌ Failed to save: ${error.message}` },
        ])
      } else {
        const categoryName = categories.find(c => c.id === args.category)?.name ?? 'Unknown'
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `✅ ${args.is_expense ? 'Expense' : 'Income'} of RM${args.amount} for ${categoryName} saved!`,
          },
        ])
      }
    }

    if (toolName === 'deleteExpense') {
      const { error } = await supabase.from('expense').delete().eq('id', args.id!)

      if (error) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `❌ Failed to delete: ${error.message}` },
        ])
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: '🗑️ Expense deleted successfully!' },
        ])
      }
    }

    setPendingToolCall(null)
    setLoading(false)
  }

  // ---- User taps Cancel ----
  const cancelAction = () => {
    setPendingToolCall(null)
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: 'Cancelled! Anything else I can help with?' },
    ])
  }

  // ---- Clear chat ----
  const clearMessages = () => {
    setMessages([])
    setPendingToolCall(null)
  }

  return {
    messages,
    loading,
    pendingToolCall,
    sendMessage,
    confirmAction,
    cancelAction,
    clearMessages,
  }
}