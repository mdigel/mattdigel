import Link from 'next/link';
import { samples } from './samples';

export const metadata = {
  title: 'Writing — Matt Digel',
  description: 'Memos and other things I have written.',
};

export default function WritingSamplesPage() {
  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-start px-6 pt-32 pb-20">
        <div className="max-w-2xl w-full">
          <h1 className="text-sm font-normal mb-6 leading-relaxed">Writing</h1>
          <ul>
            {samples.map((sample) => (
              <li key={sample.slug} className="mb-6">
                <Link
                  href={`/writing-samples/${sample.slug}`}
                  className="text-sm text-foreground hover:text-gray-600 transition-colors underline decoration-gray-300 hover:decoration-gray-500 underline-offset-2"
                >
                  {sample.title}
                </Link>
                <p className="text-sm text-gray-500 mt-2">{sample.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
