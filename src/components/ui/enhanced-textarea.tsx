
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, Paste, Undo, Redo } from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard";

export interface EnhancedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  showActions?: boolean;
  onValueChange?: (value: string) => void;
}

const EnhancedTextarea = React.forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
  ({ className, showActions = true, onValueChange, value, onChange, ...props }, ref) => {
    const { copyToClipboard, pasteToField } = useClipboard();
    const [history, setHistory] = React.useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = React.useState(-1);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useImperativeHandle(ref, () => textareaRef.current!);

    const currentValue = (value as string) || '';

    const updateValue = React.useCallback((newValue: string) => {
      if (onValueChange) {
        onValueChange(newValue);
      }
      
      const event = {
        target: { value: newValue }
      } as React.ChangeEvent<HTMLTextAreaElement>;
      
      if (onChange) {
        onChange(event);
      }
    }, [onValueChange, onChange]);

    const addToHistory = React.useCallback((val: string) => {
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(val);
        return newHistory.slice(-50); // Keep last 50 entries
      });
      setHistoryIndex(prev => prev + 1);
    }, [historyIndex]);

    const handleCopy = React.useCallback(() => {
      copyToClipboard(currentValue, 'Text copied');
    }, [copyToClipboard, currentValue]);

    const handlePaste = React.useCallback(async () => {
      await pasteToField(updateValue, 'Text pasted');
    }, [pasteToField, updateValue]);

    const handleUndo = React.useCallback(() => {
      if (historyIndex > 0) {
        const prevValue = history[historyIndex - 1];
        setHistoryIndex(historyIndex - 1);
        updateValue(prevValue);
      }
    }, [history, historyIndex, updateValue]);

    const handleRedo = React.useCallback(() => {
      if (historyIndex < history.length - 1) {
        const nextValue = history[historyIndex + 1];
        setHistoryIndex(historyIndex + 1);
        updateValue(nextValue);
      }
    }, [history, historyIndex, updateValue]);

    const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              handleRedo();
            } else {
              e.preventDefault();
              handleUndo();
            }
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
          case 'c':
            if (textareaRef.current?.selectionStart === textareaRef.current?.selectionEnd) {
              e.preventDefault();
              handleCopy();
            }
            break;
          case 'v':
            if (textareaRef.current?.selectionStart === textareaRef.current?.selectionEnd) {
              e.preventDefault();
              handlePaste();
            }
            break;
        }
      }
      
      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
    }, [handleUndo, handleRedo, handleCopy, handlePaste, props]);

    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      
      // Add to history if significant change
      if (Math.abs(newValue.length - currentValue.length) > 10 || 
          newValue.includes('\n') !== currentValue.includes('\n')) {
        addToHistory(currentValue);
      }
      
      updateValue(newValue);
    }, [currentValue, addToHistory, updateValue]);

    React.useEffect(() => {
      if (currentValue && history.length === 0) {
        setHistory([currentValue]);
        setHistoryIndex(0);
      }
    }, [currentValue, history.length]);

    return (
      <div className="relative">
        <textarea
          ref={textareaRef}
          className={cn(
            "flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical",
            showActions && "pr-20",
            className
          )}
          value={currentValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          {...props}
        />
        
        {showActions && (
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
              title="Copy (Ctrl+C)"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={handlePaste}
              title="Paste (Ctrl+V)"
            >
              <Paste className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    );
  }
);

EnhancedTextarea.displayName = "EnhancedTextarea";

export { EnhancedTextarea };
