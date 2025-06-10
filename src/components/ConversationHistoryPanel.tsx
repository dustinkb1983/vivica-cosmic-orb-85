import React, { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ConversationHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ConversationMessage[];
  onEditMessage: (id: string, newContent: string) => void;
  onDeleteMessage: (id: string) => void;
  onClearHistory: () => void;
}

export const ConversationHistoryPanel: React.FC<ConversationHistoryPanelProps> = ({
  isOpen,
  onClose,
  messages,
  onEditMessage,
  onDeleteMessage,
  onClearHistory
}) => {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');

  const startEditing = useCallback((id: string, content: string) => {
    setEditingMessageId(id);
    setEditedContent(content);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingMessageId(null);
    setEditedContent('');
  }, []);

  const saveEditedMessage = useCallback(() => {
    if (editingMessageId) {
      onEditMessage(editingMessageId, editedContent);
      cancelEditing();
    }
  }, [editingMessageId, editedContent, onEditMessage, cancelEditing]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-history-panel>
      <div className="relative bg-gray-900 rounded-lg shadow-lg max-w-2xl w-full h-4/5 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Conversation History</h2>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-100" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="p-4 overflow-y-auto flex-grow">
          {messages.length === 0 ? (
            <div className="text-gray-500 text-center">No messages in history.</div>
          ) : (
            <ul className="space-y-2">
              {messages.map(msg => (
                <li key={msg.id} className="px-4 py-2 rounded-lg" style={{ backgroundColor: msg.role === 'user' ? '#2D3748' : '#4A5568' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: msg.role === 'user' ? '#BEE3F8' : '#F6AD55' }}>
                      {msg.role === 'user' ? 'You:' : 'VIVICA:'}
                    </span>
                    <div className="flex space-x-2">
                      {editingMessageId === msg.id ? (
                        <>
                          <Button variant="secondary" size="sm" onClick={saveEditedMessage}>Save</Button>
                          <Button variant="ghost" size="sm" onClick={cancelEditing}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => startEditing(msg.id, msg.content)}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => onDeleteMessage(msg.id)}>Delete</Button>
                        </>
                      )}
                    </div>
                  </div>
                  {editingMessageId === msg.id ? (
                    <Textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full bg-gray-800 border-gray-600 text-white rounded-md p-2"
                    />
                  ) : (
                    <p className="text-sm text-gray-300">{msg.content}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-700">
          <Button variant="destructive" className="w-full" onClick={onClearHistory}>Clear Conversation History</Button>
        </div>
      </div>
    </div>
  );
};
