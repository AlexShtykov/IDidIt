import { useState, useRef, useCallback } from 'react';
import { Button, Textarea } from '@/components/ui';
import { PaperclipIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateEntryFormProps {
  goalId: string;
  userId: string;
  onSubmit: (params: {
    goalId: string;
    userId: string;
    content: string;
    attachments?: File[];
  }) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export function CreateEntryForm({
  goalId,
  userId,
  onSubmit,
  onCancel,
  isPending = false,
}: CreateEntryFormProps) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = content.trim();
      if (!trimmed && files.length === 0) return;
      onSubmit({
        goalId,
        userId,
        content: trimmed || ' ',
        attachments: files.length > 0 ? files : undefined,
      });
      setContent('');
      setFiles([]);
    },
    [content, files, goalId, userId, onSubmit]
  );

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...selected]);
    e.target.value = '';
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const isImage = (file: File) => IMAGE_TYPES.includes(file.type);

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Что удалось сделать? Поделитесь прогрессом..."
        className="min-h-[100px] resize-none field-sizing-content"
        rows={3}
        disabled={isPending}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={handleFileChange}
      />
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Вложения:</p>
          <div className="flex flex-wrap gap-2">
            {files.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-1 text-sm"
              >
                <span className="max-w-[120px] truncate" title={file.name}>
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="rounded p-0.5 hover:bg-muted"
                  aria-label="Удалить"
                >
                  <XIcon className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
        >
          <PaperclipIcon className="size-4" />
          Прикрепить файлы
        </Button>
        <div className="flex-1" />
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isPending}>
          Отмена
        </Button>
        <Button type="submit" size="sm" disabled={isPending || (!content.trim() && files.length === 0)}>
          {isPending ? 'Публикуем…' : 'Опубликовать'}
        </Button>
      </div>
    </form>
  );
}
