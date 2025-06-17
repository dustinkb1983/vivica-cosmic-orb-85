
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export const useClipboard = () => {
  const [isLoading, setIsLoading] = useState(false);

  const copyToClipboard = useCallback(async (text: string, successMessage?: string) => {
    setIsLoading(true);
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      toast.success(successMessage || 'Copied to clipboard');
      return true;
    } catch (error) {
      console.error('Failed to copy text:', error);
      toast.error('Failed to copy to clipboard');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const readFromClipboard = useCallback(async () => {
    setIsLoading(true);
    try {
      if (navigator.clipboard && window.isSecureContext) {
        const text = await navigator.clipboard.readText();
        return text;
      } else {
        toast.error('Clipboard read not supported in this browser');
        return null;
      }
    } catch (error) {
      console.error('Failed to read from clipboard:', error);
      toast.error('Failed to read from clipboard');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pasteToField = useCallback(async (setValue: (value: string) => void, successMessage?: string) => {
    const text = await readFromClipboard();
    if (text !== null) {
      setValue(text);
      toast.success(successMessage || 'Pasted from clipboard');
      return true;
    }
    return false;
  }, [readFromClipboard]);

  return {
    copyToClipboard,
    readFromClipboard,
    pasteToField,
    isLoading
  };
};
