import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { pb } from '@/lib/pocketbase';
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import type { Entry } from '@/types/entry';
import { cn } from '@/lib/utils';
import { HeartIcon, MessageCircleIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from 'lucide-react';

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']);

function isImageFilename(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return !!ext && IMAGE_EXTENSIONS.has(ext);
}

function getAttachmentUrl(entry: Entry, filename: string): string {
  return pb.files.getUrl(entry, filename);
}

export interface EntryCardProps {
  entry: Entry;
  isOwner: boolean;
  onDelete?: (entryId: string, goalId: string) => void;
  isDeleting?: boolean;
}

export function EntryCard({ entry, isOwner, onDelete, isDeleting }: EntryCardProps) {
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);

  const attachments = entry.attachments ?? [];
  const imageFiles = attachments.filter(isImageFilename);
  const documentFiles = attachments.filter((f) => !isImageFilename(f));

  return (
    <>
      <Card className={cn('overflow-hidden', isDeleting && 'opacity-60')}>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(entry.created), { locale: ru, addSuffix: true })}
            </span>
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-xs" className="shrink-0">
                    <MoreHorizontalIcon className="size-4" />
                    <span className="sr-only">Меню</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    <PencilIcon className="size-4" />
                    Редактировать
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={isDeleting}
                    onClick={() => onDelete?.(entry.id, entry.goal)}
                  >
                    <Trash2Icon className="size-4" />
                    Удалить
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {entry.content ? (
            <p className="text-foreground whitespace-pre-wrap break-words">{entry.content}</p>
          ) : null}

          {/* Галерея вложений */}
          {(imageFiles.length > 0 || documentFiles.length > 0) && (
            <div className="space-y-2">
              {imageFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {imageFiles.map((filename) => (
                    <button
                      key={filename}
                      type="button"
                      className="aspect-square rounded-lg overflow-hidden border bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                      onClick={() => setImageModalUrl(getAttachmentUrl(entry, filename))}
                    >
                      <img
                        src={getAttachmentUrl(entry, filename)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              {documentFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {documentFiles.map((filename) => (
                    <a
                      key={filename}
                      href={getAttachmentUrl(entry, filename)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {filename}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Button variant="ghost" size="xs" disabled>
              <HeartIcon className="size-3.5" />
              {entry.likes_count ?? 0}
            </Button>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <MessageCircleIcon className="size-3.5" />
              {entry.comments_count ?? 0}
            </span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!imageModalUrl} onOpenChange={(open) => !open && setImageModalUrl(null)}>
        <DialogContent
          className="max-w-[100vw] w-full h-full max-h-[100vh] rounded-none border-0 p-0 bg-black/95"
          showCloseButton
        >
          {imageModalUrl && (
            <img
              src={imageModalUrl}
              alt=""
              className="w-full h-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
