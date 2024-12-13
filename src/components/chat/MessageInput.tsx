import { useState, useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { MessageInputProps } from '@/services/types/chat.types';

export function MessageInput({ 
  onSend,
  disabled = false,
  placeholder = "Type a message...",
  maxLength = 1000,
  showAttachmentButton = false,
  onAttachmentSelect
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending || disabled) return;

    try {
      setSending(true);
      await onSend(message);
      setMessage('');
      setAttachments([]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && onAttachmentSelect) {
      setAttachments(prev => [...prev, ...files]);
      files.forEach(file => onAttachmentSelect(file));
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-md">
          {attachments.map((file, index) => (
            <div 
              key={index}
              className="flex items-center bg-white px-2 py-1 rounded border"
            >
              <span className="text-sm truncate max-w-[150px]">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="ml-2 text-gray-500 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex space-x-2">
        {showAttachmentButton && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAttachment}
              className="hidden"
              multiple
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Paperclip className="h-5 w-5" />
            </button>
          </>
        )}

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled || sending}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!message.trim() || sending || disabled}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      {/* Character Count */}
      {maxLength && (
        <div className="text-right text-xs text-gray-500">
          {message.length}/{maxLength}
        </div>
      )}
    </form>
  );
}