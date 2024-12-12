import { formatTime } from '@/lib/utils'
import { MessageItemProps } from './types'

export function MessageItem({ message, isOwnMessage, otherUserName }: MessageItemProps) {
  return (
    <div
      className={`flex ${
        isOwnMessage ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isOwnMessage
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <p className="text-sm font-medium mb-1">
          {isOwnMessage ? 'You' : otherUserName}
        </p>
        <p className="text-sm">{message.content}</p>
        <p className="text-xs mt-1 opacity-75">
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  )
}