
import React, { useState } from 'react';
import { X, Edit, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ConversationMessage } from '@/hooks/useConversationHistory';

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleEdit = (message: ConversationMessage) => {
    setEditingId(message.id);
    setEditContent(message.content);
  };

  const saveEdit = () => {
    if (editingId) {
      onEditMessage(editingId, editContent);
      setEditingId(null);
      setEditContent('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[80vh] bg-gray-950/95 backdrop-blur-md border-gray-800 text-white flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-800">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Conversation History
            </CardTitle>
            <CardDescription className="text-gray-400">
              {messages.length} messages
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden flex flex-col p-4">
          <div className="flex justify-end mb-4">
            <Button
              onClick={onClearHistory}
              variant="outline"
              size="sm"
              className="border-red-800 text-red-400 hover:bg-red-900/20"
            >
              Clear All History
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No conversation history yet
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg border ${
                    message.role === 'user'
                      ? 'bg-blue-950/20 border-blue-800/30'
                      : 'bg-purple-950/20 border-purple-800/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-medium ${
                      message.role === 'user' ? 'text-blue-400' : 'text-purple-400'
                    }`}>
                      {message.role === 'user' ? 'You' : 'VIVICA'}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-500 hover:text-white"
                        onClick={() => handleEdit(message)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-500 hover:text-red-400"
                        onClick={() => onDeleteMessage(message.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {editingId === message.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="bg-gray-900/50 border-gray-700 text-white resize-none"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}>Save</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-200">{message.content}</p>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(message.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
