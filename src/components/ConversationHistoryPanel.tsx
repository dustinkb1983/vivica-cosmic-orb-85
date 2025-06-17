
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { EnhancedTextarea } from '@/components/ui/enhanced-textarea';
import { ArrowLeft, Trash2, Edit2, Check, X } from 'lucide-react';
import { ConversationMessage } from '@/hooks/useConversationHistory';
import { toast } from 'sonner';

interface ConversationHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToSettings: () => void;
  messages: ConversationMessage[];
  onEditMessage: (id: string, newContent: string) => void;
  onDeleteMessage: (id: string) => void;
  onClearHistory: () => void;
}

export const ConversationHistoryPanel = ({
  isOpen,
  onClose,
  onBackToSettings,
  messages,
  onEditMessage,
  onDeleteMessage,
  onClearHistory
}: ConversationHistoryPanelProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleStartEdit = (message: ConversationMessage) => {
    setEditingId(message.id);
    setEditContent(message.content);
  };

  const handleSaveEdit = () => {
    if (editingId && editContent.trim()) {
      onEditMessage(editingId, editContent.trim());
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
      onClearHistory();
      toast.success('Conversation history cleared');
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full sm:w-[600px] flex flex-col" data-history-panel>
        <SheetHeader className="flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToSettings}
              className="p-1 h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <SheetTitle>Conversation History</SheetTitle>
          </div>
        </SheetHeader>
        
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex justify-between items-center py-2">
            <Badge variant="outline">
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </Badge>
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
          
          <Separator className="my-2" />
          
          <ScrollArea className="flex-1">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
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
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(message.timestamp)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(message)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (window.confirm('Delete this message?')) {
                              onDeleteMessage(message.id);
                              toast.success('Message deleted');
                            }
                          }}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
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
                          className="min-h-[60px]"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={!editContent.trim()}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted/50 rounded-md p-3 text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>
                    )}
                    
                    <Separator />
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};
