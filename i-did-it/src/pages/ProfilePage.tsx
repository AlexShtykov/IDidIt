import { useParams } from 'react-router-dom';

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Профиль: {username}</h1>
      <p className="mt-2 text-gray-600">Страница профиля пользователя.</p>
    </div>
  );
}
