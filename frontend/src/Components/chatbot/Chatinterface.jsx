'use client'

import { useState, useRef, useEffect } from "react"
import { Mic, Send } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Chat } from "@/app/page"

const categories = [
  {
    title: "Sales Strategies",
    description: "Get tailored advice on increasing property visibility and driving sales.",
  },
  {
    title: "Negotiation Tactics",
    description: "Learn expert negotiation tips to close deals effectively.",
  },
  {
    title: "Marketing Insights",
    description: "Discover the best marketing strategies to showcase your properties.",
  },
  {
    title: "General Support",
    description: "Need help with something else? Ask away, and we'll guide you.",
  },
]

interface ChatInterfaceProps {
  currentChat: Chat | undefined
  onSendMessage: (content: string) => void
}

export function ChatInterface({ currentChat, onSendMessage }: ChatInterfaceProps) {
  const [message, setMessage] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [currentChat?.messages])

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message)
      setMessage("")
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full justify-start h-16 p-0 bg-transparent">
            <TabsTrigger value="general" className="data-[state=active]:bg-primary/10 rounded-none h-full">
              General
            </TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:bg-primary/10 rounded-none h-full">
              Sales GPT
            </TabsTrigger>
            <TabsTrigger value="project" className="data-[state=active]:bg-primary/10 rounded-none h-full">
              Project Tracker
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {currentChat ? (
          <div className="max-w-2xl mx-auto space-y-4">
            {currentChat.messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">How can I assist you today?</h1>
              <p className="text-muted-foreground">
                Get expert guidance powered by AI agents specializing in Sales, Marketing, and Negotiation.
                Choose the agent that suits your needs and start your conversation with ease.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {categories.map((category) => (
                <Card key={category.title} className="p-6 cursor-pointer hover:bg-accent transition-colors">
                  <h3 className="font-semibold mb-2">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
      <div className="p-4 border-t bg-background">
        <div className="max-w-2xl mx-auto flex gap-2">
          <Button variant="outline" size="icon">
            <Mic className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Type your prompt here"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage()
              }
            }}
            className="flex-1"
          />
          <Button size="icon" onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

