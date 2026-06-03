import ProjectsList from '../../components/ProjectsList';

export const metadata = {
  title: 'Projects — Matt Digel',
  description: 'Things I am building.',
};

export default function ProjectsPage() {
  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-start px-6 pt-32 pb-20">
        <div className="max-w-2xl w-full">
          <h1 className="text-sm font-normal mb-6 leading-relaxed">
            Things I&apos;m building for fun.
          </h1>
          <ProjectsList />
        </div>
      </main>
    </div>
  );
}
