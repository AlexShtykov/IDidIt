import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Trash2, ImageIcon } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
  Input,
  Textarea,
} from '@/components/ui';
import { useAuthContext } from '@/features/auth';
import { useCreateGoal } from '@/features/goals';

const createGoalSchema = z.object({
  title: z.string().min(1, 'Введите название').max(200),
  description: z.string().max(5000).optional(),
  target_date: z.string().optional(),
  subtasks: z
    .array(
      z.object({
        title: z.string().min(1, 'Введите название шага'),
        target_date: z.string().optional(),
      })
    )
    .optional(),
});

type CreateGoalFormValues = z.infer<typeof createGoalSchema>;

const SIDEBAR_TIPS = {
  title: 'Как ставить цели правильно?',
  items: [
    { label: 'Конкретность', text: 'Цель должна быть чёткой и понятной, без размытых формулировок.' },
    { label: 'Измеримость', text: 'Должен быть способ проверить, что цель достигнута.' },
    { label: 'Реалистичность', text: 'Цель должна быть достижимой при ваших ресурсах и времени.' },
    { label: 'Сроки', text: 'Укажите дату или период — это мотивирует и помогает планировать.' },
  ],
};

const MAX_IMAGES = 5;

type ImageWithPreview = { file: File; url: string };

export function CreateGoalPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { mutateAsync: createGoal, isPending } = useCreateGoal();
  const [uploadedImages, setUploadedImages] = useState<ImageWithPreview[]>([]);
  const imagesRef = useRef(uploadedImages);
  imagesRef.current = uploadedImages;

  const form = useForm<CreateGoalFormValues>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      title: '',
      description: '',
      target_date: '',
      subtasks: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'subtasks',
  });

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      const newFiles = Array.from(files)
        .filter((f) => f.type.startsWith('image/'))
        .map((file) => ({ file, url: URL.createObjectURL(file) }));
      setUploadedImages((prev) => [...prev, ...newFiles].slice(0, MAX_IMAGES));
    },
    []
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const removeImage = useCallback((index: number) => {
    setUploadedImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index].url);
      return next;
    });
  }, []);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  const onSubmit = async (data: CreateGoalFormValues) => {
    if (!user?.id) return;
    try {
      const goal = await createGoal({
        ...data,
        userId: user.id,
        images: uploadedImages.length ? uploadedImages.map((x) => x.file) : undefined,
      });
      toast.success('Цель создана!');
      if (goal?.id) {
        navigate(`/goals/${goal.id}`);
      } else {
        navigate('/goals');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось создать цель');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_280px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Основное */}
            <Card>
              <CardHeader>
                <CardTitle>Основное</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Заголовок цели</FormLabel>
                      <FormControl>
                        <Input placeholder="Например: выучить английский до B2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Описание результата</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Опишите результат, который хотите получить"
                          className="min-h-[120px]"
                          maxLength={5000}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Опишите, как вы поймёте что цель достигнута
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="target_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Дата достижения</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Изображения */}
            <Card>
              <CardHeader>
                <CardTitle>Изображения</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  role="button"
                  tabIndex={0}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onClick={() => document.getElementById('goal-images-input')?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      document.getElementById('goal-images-input')?.click();
                    }
                  }}
                  className="border-input flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 transition-colors hover:bg-muted/50"
                >
                  <ImageIcon className="text-muted-foreground size-8" />
                  <span className="text-muted-foreground text-sm">
                    Перетащите фото сюда или нажмите, чтобы добавить
                  </span>
                  <span className="text-muted-foreground text-xs">
                    До {MAX_IMAGES} изображений
                  </span>
                </div>
                <input
                  id="goal-images-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                {uploadedImages.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {uploadedImages.map((item, index) => (
                      <div
                        key={item.url}
                        className="relative inline-block"
                      >
                        <img
                          src={item.url}
                          alt=""
                          className="size-20 rounded-lg object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-xs"
                          className="absolute -right-1 -top-1 size-5 rounded-full"
                          onClick={() => removeImage(index)}
                          aria-label="Удалить фото"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Шаги к цели */}
            <Card>
              <CardHeader>
                <CardTitle>Шаги к цели</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Разбейте цель на шаги (необязательно)
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border-input flex flex-wrap items-end gap-3 rounded-lg border p-3"
                  >
                    <FormField
                      control={form.control}
                      name={`subtasks.${index}.title`}
                      render={({ field: f }) => (
                        <FormItem className="min-w-[200px] flex-1">
                          <FormLabel className="text-xs">Название шага</FormLabel>
                          <FormControl>
                            <Input placeholder="Шаг" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`subtasks.${index}.target_date`}
                      render={({ field: f }) => (
                        <FormItem className="w-[140px]">
                          <FormLabel className="text-xs">Дата</FormLabel>
                          <FormControl>
                            <Input type="date" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      aria-label="Удалить шаг"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ title: '', target_date: '' })}
                >
                  <Plus className="size-4" />
                  Добавить шаг
                </Button>
              </CardContent>
            </Card>

            {/* Кнопки */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isPending}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Создание…' : 'Опубликовать'}
              </Button>
            </div>
          </form>
        </Form>

        {/* Sidebar с подсказками */}
        <aside className="lg:block">
          <Card className="sticky top-4">
            <details className="group" open>
              <summary className="cursor-pointer list-none px-6 py-4 font-semibold [&::-webkit-details-marker]:hidden">
                {SIDEBAR_TIPS.title}
              </summary>
              <CardContent className="border-t pt-4">
                <ul className="space-y-3">
                  {SIDEBAR_TIPS.items.map((item) => (
                    <li key={item.label}>
                      <span className="font-medium">{item.label}.</span>{' '}
                      <span className="text-muted-foreground text-sm">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </details>
          </Card>
        </aside>
      </div>
    </div>
  );
}
