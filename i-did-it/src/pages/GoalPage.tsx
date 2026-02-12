import { useParams } from 'react-router-dom';

export function GoalPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Цель #{id}</h1>
      <p className="mt-2 text-gray-600">Страница цели.</p>
    </div>
  );
}
