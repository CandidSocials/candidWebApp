import { useState } from 'react';
import { MessageItemProps } from '@/services/types/chat.types';
import { formatTime } from '@/lib/utils';
import { MoreVertical, Edit2, Trash2, Check, X } from 'lucide-react';

export function MessageItem({ 
  message, 
  isOwnMessage, 
  otherUserName,
  showTimestamp = true,
  onDelete,
  onEdit 
}: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [showOptions, setShowOptions] = useState(false);

  const handleEdit = () => {
    if (onEdit && editedContent !== message.content) {
      onEdit(editedContent);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

  return (
    <div
      className={`group flex ${
        isOwnMessage ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 relative ${
          isOwnMessage
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {/* Sender Name */}
        <p className="text-sm font-medium mb-1">
          {isOwnMessage ? 'You' : otherUserName}
        </p>

        {/* Message Content */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-2 rounded border bg-white text-gray-900 text-sm"
              rows={2}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancel}
                className="p-1 rounded hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                onClick={handleEdit}
                className="p-1 rounded hover:bg-green-100"
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="relative group">
            <p className="text-sm break-words">{message.content}</p>
            
            {/* Message Options */}
            {isOwnMessage && (
              <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="p-1 rounded hover:bg-gray-200"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                
                {showOptions && (
                  <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg py-1 z-10">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowOptions(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => {
                          onDelete();
                          setShowOptions(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        {showTimestamp && (
          <p className="text-xs mt-1 opacity-75">
            {formatTime(message.created_at)}
            {message.is_edited && 
              <span className="ml-1 text-xs opacity-75">(edited)</span>
            }
          </p>
        )}

        {/* Message Status */}
        {isOwnMessage && (
          <span className="text-xs opacity-75 ml-2">
            {message.status === 'sent' && '✓'}
            {message.status === 'delivered' && '✓✓'}
            {message.status === 'read' && '✓✓'}
          </span>
        )}
      </div>
    </div>
  );
}