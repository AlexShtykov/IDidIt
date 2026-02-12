import { useState } from 'react';
import { useEntries, useCreateEntry, useDeleteEntry } from '@/features/entries';
import { useAuthContext } from '@/features/auth';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { EntryCard } from './EntryCard';
import { CreateEntryForm } from './CreateEntryForm';
import { PlusIcon } from 'lucide-react';

export interface EntryListProps {
  goalId: string;
  isOwner: boolean;
}

export function EntryList({ goalId, isOwner }: EntryListProps) {
  const { user } = useAuthContext();
  const { data: entries = [], isLoading } = useEntries(goalId);
  const createEntry = useCreateEntry();
  const deleteEntry = useDeleteEntry();
  const [showForm, setShowForm] = useState(false);

  const handleCreate = (params: {
    goalId: string;
    userId: string;
    content: string;
    attachments?: File[];
  }) => {
    createEntry.mutate(params, {
      onSuccess: () => setShowForm(false),
    });
  };

  const handleDelete = (entryId: string, goalIdForEntry: string) => {
    deleteEntry.mutate({ entryId, goalId: goalIdForEntry });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Дневник прогресса</CardTitle>
        {isOwner && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
            disabled={showForm}
          >
            <PlusIcon className="size-4" />
            Добавить запись
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isOwner && showForm && user && (
          <CreateEntryForm
            goalId={goalId}
            userId={user.id}
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            isPending={createEntry.isPending}
          />
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Загрузка записей…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Записей пока нет. Начните вести дневник прогресса!
          </p>
        ) : (
          <ul className="space-y-3 list-none p-0 m-0">
            {entries.map((entry) => (
              <li key={entry.id}>
                <EntryCard
                  entry={entry}
                  isOwner={isOwner}
                  onDelete={handleDelete}
                  isDeleting={deleteEntry.isPending && deleteEntry.variables?.entryId === entry.id}
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
