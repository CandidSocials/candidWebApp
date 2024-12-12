import { ChatList } from '../components/chat/ChatList'

export function Chats() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Chats</h1>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <ChatList />
      </div>
    </div>
  )
}