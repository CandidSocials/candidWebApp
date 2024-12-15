import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Chat } from './Chat'
import { ChatModalProps } from './types'

export function ChatModal({ chatId, jobTitle, otherUserId, otherUserName }: ChatModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover">
          <MessageSquare className="h-5 w-5 mr-2" />
          Chat
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Chat - {jobTitle}</DialogTitle>
        </DialogHeader>
        <Chat 
          chatId={chatId} 
          otherUserId={otherUserId}
          otherUserName={otherUserName} 
        />
      </DialogContent>
    </Dialog>
  )
}