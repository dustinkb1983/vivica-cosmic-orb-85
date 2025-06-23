
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { EnhancedTextarea } from '@/components/ui/enhanced-textarea';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { useConversationHistory } from '@/hooks/useConversationHistory';
import { toast } from 'sonner';

export const ConversationHistoryContent = () => {
  const { messages, editMessage, deleteMessage, clearHistory } = useConversationHistory();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleStartEdit = (message: any) => {
    setEditingId(message.id);
    setEditContent(message.content);
  };

  const handleSaveEdit = () => {
    if (editingId && editContent.trim()) {
      editMessage(editingId, editContent.trim());
      setEditingId(null);
      setEditContent('');
      toast.success('Message updated');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all conversation history?')) {
      clearHistory();
      toast.success('Conversation history cleared');
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-4 h-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">Conversation History</h3>
          <Badge variant="outline" className="border-purple-500/30 text-purple-400">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        {messages.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearAll}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>
      
      <Separator className="border-gray-800" />
      
      <ScrollArea className="h-[400px]">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No conversation history yet.
          </div>
        ) : (
          <div className="space-y-4 pr-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={message.role === 'user' ? 'default' : 'secondary'}>
                    {message.role === 'user' ? 'You' : 'VIVICA'}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(message.timestamp)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartEdit(message)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Delete this message?')) {
                          deleteMessage(message.id);
                          toast.success('Message deleted');
                        }
                      }}
                      className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {editingId === message.id ? (
                  <div className="space-y-2">
                    <EnhancedTextarea
                      value={editContent}
                      onValueChange={setEditContent}
                      placeholder="Edit message..."
                      className="min-h-[60px] bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={!editContent.trim()}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="border-gray-700 text-gray-300 hover:bg-gray-800"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-900/30 rounded-md p-3 text-sm text-gray-300 whitespace-pre-wrap border border-gray-800">
                    {message.content}
                  </div>
                )}
                
                <Separator className="border-gray-800" />
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
