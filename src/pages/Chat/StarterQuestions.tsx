import { Button } from '@/components/ui/button';

interface StarterQuestionsProps {
  questions: string[];
  dataLoading: boolean;
  onQuestionClick: (question: string) => void;
}

export function StarterQuestions({ questions, dataLoading, onQuestionClick }: StarterQuestionsProps) {
  return (
    <div className="mb-4">
      <p className="text-sm text-muted-foreground mb-2">Try asking:</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, idx) => (
          <Button
            key={idx}
            variant="outline"
            size="sm"
            onClick={() => onQuestionClick(question)}
            disabled={dataLoading}
            className="text-xs"
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
}
