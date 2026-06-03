const projects = [
  {
    name: 'Plymouth App Labs',
    url: 'https://plymouthapplabs.com',
    description: 'Premium utility iOS apps without monthly fees',
  },
  {
    name: '5lb Coffee',
    url: 'https://www.get5lbcoffee.com/',
    description: 'Bulk specialty coffee, shipped fresh',
  },
];

export default function ProjectsList() {
  return (
    <>
      {projects.map((project) => (
        <div key={project.url} className="mb-6">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-foreground hover:text-gray-600 transition-colors underline decoration-gray-300 hover:decoration-gray-500 underline-offset-2 inline-flex items-center gap-1"
          >
            {project.name}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="inline-block"
            >
              <path
                d="M3 9L9 3M9 3H4.5M9 3V7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <p className="text-sm text-gray-500 mt-2">{project.description}</p>
        </div>
      ))}
    </>
  );
}
