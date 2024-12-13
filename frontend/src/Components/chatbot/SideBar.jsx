'use client'

import { useState } from "react"
import Link from "next/link"
import { MessageSquare, LayoutDashboard, BarChart3, Database, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Chat } from "@/app/page"

const navigationItems = [
  { icon: LayoutDashboard, label: "Canned Dashboards", href: "/dashboard" },
  { icon: MessageSquare, label: "Chatbot", href: "/chatbot", active: true },
  { icon: BarChart3, label: "Report Builder", href: "/reportbuilder" },
  { icon: Database, label: "Data Sources", href: "/upload" },
  { icon: BarChart3, label: "ChartReport", href: "/chartreport" },
  { icon: BarChart3, label: "RDesigner", href: "/reportdesigner" },
  { icon: BarChart3, label: "UpdatedCanva", href: "/UpdatedCanva" },
]

interface SidebarProps {
  chats: Chat[]
  currentChatId: string | null
  onChatSelect: (chatId: string) => void
  onNewChat: () => void
}

export function Sidebar({ chats, currentChatId, onChatSelect, onNewChat }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const toggleCollapse = () => {
    setCollapsed(!collapsed)
  }

  return (
    <div className={`border-r flex flex-col bg-background transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 flex justify-between items-center">
        {!collapsed && <h1 className="text-xl font-bold">Dashboard</h1>}
        <Button variant="ghost" size="icon" onClick={toggleCollapse}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <nav className="space-y-2 p-2">
          {navigationItems.map((item) => (
            <Button
              key={item.label}
              variant={item.active ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href={item.href}>
                <item.icon className="h-4 w-4" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </Button>
          ))}
        </nav>
        {!collapsed && (
          <>
            <div className="p-2">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={onNewChat}>
                <MessageSquare className="h-4 w-4" />
                New Chat
              </Button>
            </div>
            <div className="p-2">
              <h2 className="text-sm font-semibold mb-2">Recent Chats</h2>
              {chats.map((chat) => (
                <Button
                  key={chat.id}
                  variant={chat.id === currentChatId ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm mb-1"
                  onClick={() => onChatSelect(chat.id)}
                >
                  {chat.title}
                </Button>
              ))}
            </div>
          </>
        )}
      </ScrollArea>
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>PM</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex flex-col items-start text-sm">
              <span className="font-medium">Project Manager</span>
              <span className="text-xs text-muted-foreground">View Profile</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}

