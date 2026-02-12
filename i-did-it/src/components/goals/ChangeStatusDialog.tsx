import { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { ImagePlus, X } from 'lucide-react';
import { useUpdateGoalStatus } from '@/features/goals';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Textarea,
} from '@/components/ui';

const formSchema = z.object({
  comment: z.string().min(10, 'Минимум 10 символов'),
});

type FormValues = z.infer<typeof formSchema>;

export interface ChangeStatusDialogProps {
  goalId: string;
  newStatus: 'completed' | 'cancelled';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ChangeStatusDialog({
  goalId,
  newStatus,
  open,
  onOpenChange,
  onSuccess,
}: ChangeStatusDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { mutateAsync: updateStatus, isPending } = useUpdateGoalStatus();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { comment: '' },
  });

  const commentLabel =
    newStatus === 'completed' ? 'Расскажите о результате' : 'Почему отменяете?';
  const title =
    newStatus === 'completed'
      ? 'Отметить цель выполненной'
      : 'Отменить цель';

  useEffect(() => {
    if (!open) {
      form.reset({ comment: '' });
      setSelectedImage(undefined);
    }
  }, [open, form]);

  useEffect(() => {
    if (!selectedImage) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      return;
    }
    const url = URL.createObjectURL(selectedImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
    }
    e.target.value = '';
  };

  const removeImage = () => {
    setSelectedImage(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await updateStatus({
        goalId,
        status: newStatus,
        comment: data.comment,
        image: selectedImage,
      });

      toast.success(
        newStatus === 'completed'
          ? '🎉 Поздравляем! Цель достигнута!'
          : 'Цель отменена'
      );

      if (newStatus === 'completed') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Не удалось обновить статус цели'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{commentLabel}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={commentLabel}
                      className="min-h-24 resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Фото (необязательно)</FormLabel>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                aria-hidden
              />
              {!previewUrl ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <ImagePlus className="size-4" />
                  Добавить фото
                </Button>
              ) : (
                <div className="relative inline-block">
                  <img
                    src={previewUrl}
                    alt="Превью"
                    className="h-24 w-auto rounded-lg border object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -right-2 -top-2 size-7"
                    onClick={removeImage}
                    aria-label="Удалить фото"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Отправка…' : 'Подтвердить'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
