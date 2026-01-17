import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '@/services/chatService';

interface ChatMessageProps {
  message: ChatMessageType;
  onQuestionClick: (question: string) => void;
}

function formatMessage(content: string) {
  const lines = content.split('\n');
  return lines.map((line, idx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const formatted = parts.map((part, partIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
    
    return (
      <span key={idx}>
        {formatted}
        {idx < lines.length - 1 && <br />}
      </span>
    );
  });
}

export function ChatMessage({ message, onQuestionClick }: ChatMessageProps) {
  return (
    <div
      className={cn(
        'flex',
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-3',
          message.role === 'user'
            ? 'bg-primary text-primary-foreground ml-12'
            : 'bg-muted mr-12'
        )}
      >
        <div className="text-sm whitespace-pre-wrap">
          {formatMessage(message.content)}
        </div>
        <div
          className={cn(
            'text-xs mt-1',
            message.role === 'user'
              ? 'text-primary-foreground/70'
              : 'text-muted-foreground'
          )}
        >
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
        
        {message.role === 'assistant' && message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">You might also ask:</p>
            <div className="flex flex-wrap gap-1">
              {message.suggestedQuestions.map((question, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 text-xs"
                  onClick={() => onQuestionClick(question)}
                >
                  {question}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
