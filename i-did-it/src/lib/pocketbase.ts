import PocketBase from 'pocketbase';

export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090');

// Включаем автообновление токена
pb.autoCancellation(false);

/**
 * Извлекает понятное сообщение из ошибки PocketBase (ClientResponseError).
 * Учитывает status: при 403 без message подсказывает проверить API Rules.
 * @param preferredFields — приоритетные поля (например, ['username', 'avatar']) — их сообщения вернутся первыми.
 */
export function getPbErrorMessage(
  err: unknown,
  preferredFields?: string[]
): string {
  const e = err as {
    message?: string;
    status?: number;
    response?: { message?: string; data?: Record<string, { message?: string }> };
    data?: { message?: string; data?: Record<string, { message?: string }> };
  };
  const response = e?.response ?? e?.data;
  const fieldErrors = response?.data;
  if (fieldErrors && typeof fieldErrors === 'object') {
    for (const key of preferredFields ?? []) {
      const v = fieldErrors[key];
      if (v && typeof v === 'object' && typeof (v as { message?: string }).message === 'string') {
        return (v as { message: string }).message;
      }
    }
    const first = Object.values(fieldErrors).find(
      (v): v is { message?: string } => v && typeof v === 'object' && 'message' in v
    );
    if (first?.message) return first.message;
  }
  const msg = response?.message ?? e?.message;
  if (msg && msg !== 'Something went wrong.') return msg;
  const status = e?.status;
  // Сетевая ошибка (сервер не запущен, CORS, неправильный URL)
  if (status === 0 || (e?.message === 'Something went wrong.' && status === undefined)) {
    return 'Не удалось подключиться к серверу. Проверьте: 1) PocketBase запущен (например .\\pocketbase.exe serve); 2) в .env указан VITE_POCKETBASE_URL=http://127.0.0.1:8090 при необходимости.';
  }
  if (status === 403) {
    return 'Нет прав. В админке PocketBase: Collections → users → API Rules — для входа/регистрации проверьте правила List/View/Create.';
  }
  if (status === 404) return 'Запись не найдена.';
  if (status === 400) return msg ?? 'Неверные данные (проверьте поля формы).';
  return msg ?? 'Не удалось выполнить запрос';
}
