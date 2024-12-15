import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthProvider';
import Chat from '../../components/Chat';

export default function ChatPage() {
  const router = useRouter();
  const { userId } = router.query;
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Please log in to access the chat</p>
      </div>
    );
  }

  if (!userId || typeof userId !== 'string') {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Invalid user selected</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto h-screen p-4">
      <div className="h-full border rounded-lg shadow-lg overflow-hidden">
        <Chat receiverId={userId} />
      </div>
    </div>
  );
}
