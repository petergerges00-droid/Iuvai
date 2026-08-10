import { useEffect, useState } from 'react';
import {
  getAllEvaluations,
  type Evaluation,
} from '../../lib/supabase';

interface Props {
  onCreate?: () => void;
  onEdit?: (evaluationId: string) => void;
}

export default function AdminEvaluations({
  onCreate,
  onEdit,
}: Props) {
  const [evaluations, setEvaluations] = useState<
    Evaluation[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEvaluations();
  }, []);

  async function loadEvaluations() {
    try {
      setLoading(true);
      setError('');

      const data = await getAllEvaluations();

      setEvaluations(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load evaluations.'
      );
    } finally {
      setLoading(false);
    }
  }

  function getStatusClasses(
    status: Evaluation['status']
  ) {
    switch (status) {
      case 'open':
        return 'bg-green-50 text-green-700 border-green-200';

      case 'closed':
        return 'bg-gray-50 text-gray-600 border-gray-200';

      case 'draft':
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        Loading evaluations...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">
            Evaluations
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create and manage expert evaluations for IUVAI.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
        >
          + Create evaluation
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {evaluations.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <h2 className="font-medium">
            No evaluations yet
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Create your first evaluation to begin
            assessing domain experts.
          </p>

          <button
            type="button"
            onClick={onCreate}
            className="mt-5 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Create evaluation
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <div className="hidden grid-cols-[1fr_160px_180px_120px] gap-4 border-b bg-gray-50 px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 md:grid">
            <div>Evaluation</div>
            <div>Field</div>
            <div>Created</div>
            <div>Status</div>
          </div>

          <div className="divide-y">
            {evaluations.map((evaluation) => (
              <button
                key={evaluation.id}
                type="button"
                onClick={() => onEdit?.(evaluation.id)}
                className="block w-full text-left transition hover:bg-gray-50"
              >
                <div className="grid gap-3 px-5 py-5 md:grid-cols-[1fr_160px_180px_120px] md:items-center md:gap-4">
                  <div>
                    <div className="font-medium">
                      {evaluation.title}
                    </div>

                    {evaluation.description && (
                      <div className="mt-1 line-clamp-2 text-sm text-gray-500">
                        {evaluation.description}
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-600">
                    {evaluation.primary_field || '—'}
                  </div>

                  <div className="text-sm text-gray-500">
                    {new Date(
                      evaluation.created_at
                    ).toLocaleDateString()}
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusClasses(
                        evaluation.status
                      )}`}
                    >
                      {evaluation.status}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
