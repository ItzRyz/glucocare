"use client"

import { useEffect, useRef, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Send, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api, ApiClientError } from "@/lib/api-client"
import type { ChatMessage, ChatRoom } from "@/types/api"

export default function ChatPanel() {
  const { user } = useUser()
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [content, setContent] = useState("")
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mounted = true
    async function loadRooms() {
      try {
        const data = await api.chat.rooms()
        if (!mounted) return
        setRooms(data)
        if (data.length > 0) setSelectedRoom(data[0])
      } catch {
        if (mounted) setError("Unable to load chat rooms")
      } finally {
        if (mounted) setLoadingRooms(false)
      }
    }
    loadRooms()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!selectedRoom) return

    let mounted = true
    async function loadMessages() {
      setLoadingMessages(true)
      try {
        const data = await api.chat.messages(selectedRoom!.id)
        if (mounted) setMessages(data)
      } catch {
        if (mounted) setMessages([])
      } finally {
        if (mounted) setLoadingMessages(false)
      }
    }
    loadMessages()
    return () => { mounted = false }
  }, [selectedRoom])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRoom || !content.trim()) return

    setSending(true)
    try {
      const msg = await api.chat.send({ roomId: selectedRoom.id, content: content.trim() })
      setMessages((prev) => [...prev, msg])
      setContent("")
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const getOtherParty = (room: ChatRoom) => {
    if (user?.id === room.patientId) return room.doctor
    return room.patient
  }

  if (loadingRooms) {
    return <Skeleton className="h-[400px] w-full" />
  }

  if (rooms.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground text-sm">
          No chat rooms yet. Book an appointment to start a consultation.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader className="border-b py-3">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-base">Consultation Chat</CardTitle>
          {rooms.length > 1 && (
            <select
              className="text-sm border rounded-md px-2 py-1 bg-background"
              value={selectedRoom?.id ?? ""}
              onChange={(e) => setSelectedRoom(rooms.find((r) => r.id === e.target.value) ?? null)}
            >
              {rooms.map((room) => {
                const other = getOtherParty(room)
                return (
                  <option key={room.id} value={room.id}>
                    {other.name} ({room.status.name})
                  </option>
                )
              })}
            </select>
          )}
        </div>
        {selectedRoom && (
          <p className="text-xs text-muted-foreground">
            Chatting with {getOtherParty(selectedRoom).name}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto py-4 space-y-3">
        {loadingMessages ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-10 w-2/3 ml-auto" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No messages yet. Start the conversation.</p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === user?.id
            return (
              <div key={msg.id} className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={msg.sender.avatarUrl ?? undefined} />
                  <AvatarFallback>{msg.sender.name[0]}</AvatarFallback>
                </Avatar>
                <div className={`max-w-[75%] ${isOwn ? "text-right" : ""}`}>
                  <div className={`rounded-lg px-3 py-2 text-sm ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {msg.content}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {format(new Date(msg.createdAt), "HH:mm")}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </CardContent>

      <form onSubmit={handleSend} className="border-t p-3 flex gap-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          disabled={sending || !selectedRoom}
        />
        <Button type="submit" size="icon" disabled={sending || !content.trim() || !selectedRoom}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
      {error && <p className="text-xs text-destructive px-3 pb-2">{error}</p>}
    </Card>
  )
}
