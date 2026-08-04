import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import { FullPageSpinner } from '../components/Spinner';
import InterviewReport from '../components/InterviewReport';

export default function InterviewSessionDetail() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/interview/sessions/${id}`)
      .then(setSession)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-red-500">{error}</p>
        <Link to="/interview" className="btn-primary mt-4">
          <ArrowLeft size={16} /> Back to interview hub
        </Link>
      </div>
    );
  }
  if (!session) return <FullPageSpinner label="Loading session…" />;

  return (
    <div>
      <InterviewReport session={session} />
    </div>
  );
}
