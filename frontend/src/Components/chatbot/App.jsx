'use client'

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatInterface } from "@/components/chat-interface"

export type Message = {
  role: 'user' | 'assistant'
  content: string
}

export type Chat = {
  id: string
  title: string
  messages: Message[]
}

export default function DashboardPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)

  const addNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: `New Chat ${chats.length + 1}`,
      messages: []
    }
    setChats([newChat, ...chats])
    setCurrentChatId(newChat.id)
  }

  const addMessageToChat = (chatId: string, message: Message) => {
    setChats(chats.map(chat => 
      chat.id === chatId 
        ? { ...chat, messages: [...chat.messages, message] }
        : chat
    ))
  }

  const handleSendMessage = (content: string) => {
    if (currentChatId) {
      // Add user message
      addMessageToChat(currentChatId, { role: 'user', content })

      // Simulate bot response
      setTimeout(() => {
        const botResponse = `Thank you for your message: "${content}". How can I assist you further?`
        addMessageToChat(currentChatId, { role: 'assistant', content: botResponse })
      }, 1000)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        chats={chats} 
        currentChatId={currentChatId} 
        onChatSelect={setCurrentChatId} 
        onNewChat={addNewChat} 
      />
      <main className="flex-1 overflow-hidden">
        <ChatInterface 
          currentChat={chats.find(chat => chat.id === currentChatId)}
          onSendMessage={handleSendMessage}
        />
      </main>
    </div>
  )
}

