import Link from 'next/link';
import { getSample } from '../samples';

const { title: TITLE, description: SUBTITLE } = getSample('scaling-the-product-org');

export const metadata = {
  title: `${TITLE} — Matt Digel`,
  description: SUBTITLE,
};

const linkClass =
  'text-foreground underline decoration-gray-300 hover:decoration-gray-500 underline-offset-2 transition-colors';

const sections = [
  {
    heading: 'My philosophy on product leadership',
    items: [
      {
        lead: 'Player-coach.',
        body: 'Stay close enough to the work to recognize excellence and navigate tough decisions: vibe-coding prototypes, MCP-ing Mixpanel analytics, Figma comment debates.',
      },
      {
        lead: 'Two questions I ask in every product situation:',
        body: '(1) What is the user really trying to do right now? (2) What is the user feeling right now?',
      },
      {
        lead: 'Foundational psychology.',
        body: (
          <>
            Motivation theory: (Motivation − Friction)<sup>Satisfaction</sup> = Repeat Action.
          </>
        ),
      },
      {
        lead: 'Swim in the feedback river.',
        body: 'Daily customer calls, surveys, analytics, and direct exposure to the user experience.',
      },
    ],
  },
  {
    heading: 'How I would run the product organization',
    intro: (
      <>
        Heavily influenced by Felix Anthony (former Amazon executive) and Andy Grove&apos;s{' '}
        <cite>High Output Management</cite>.
      </>
    ),
    items: [
      {
        lead: 'Cross-team prioritization.',
        body: 'Each product has metrics worth improving, but not all improvements are equal right now. Company stage, strategic ambitions and constraints determine where we invest.',
      },
      {
        lead: 'Weekly coaching.',
        body: '45 minute 1:1s with every PM. 30 minutes is too short. PM-led.',
      },
      {
        lead: 'Extremely high talent bar.',
        body: "Structured interviews with question-level rubrics, case studies, take-homes, and an internship pipeline. Great talent isn't limited to former FAANG employees.",
      },
      {
        lead: 'Metrics.',
        body: 'Weekly Business Reviews for each product area. AI-native Product Analyst to automate.',
      },
      {
        lead: 'User empathy at scale.',
        body: 'Remove friction between teams and users (clients, families, clinicians, and operations) through PHI-safe Slack channels, call-recordings and Customer Insights AI agents.',
      },
    ],
  },
  {
    heading: 'How I would develop Product Talent',
    items: [
      {
        lead: 'Assess the team.',
        body: 'Evaluate motivation, domain knowledge, and product skills using a defined rubric.',
      },
      {
        lead: 'Mindsets to reinforce.',
        body: (
          <>
            <a
              href="https://www.highagency.com"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              HighAgency.com
            </a>
            , growth mindset and strong personal ownership.
          </>
        ),
      },
      {
        lead: 'Make expectations explicit.',
        body: "Share my High Performer memo. Surface problems early. Performance reviews should never contain surprises. Being empathetic and holding a high bar aren't contradictory.",
      },
      {
        lead: 'Invest in craft.',
        body: "Reforge courses for junior PMs (acquisition, retention, experimentation); Shreyas Doshi's World-Class Product Sense course for senior PMs.",
      },
      {
        lead: 'Mental simulation.',
        body: 'Teach PMs to anticipate how others might think, feel, and act based on their context, motivations, and experiences.',
      },
    ],
  },
  {
    heading: "What I'd do in my first 60 days",
    items: [
      {
        lead: 'Understand the mandate.',
        body: 'Deeply understand what the founders expect from their Head of Product.',
      },
      {
        lead: 'Learn from the experts.',
        body: 'Listen, a lot. Hold 45-minute whiteboard sessions with every PM, EM, tech lead, ops lead, and select clinicians. Have each person teach me what they know best (users, the business, technology, or operations) in their own way.',
      },
      {
        lead: 'Map the journeys.',
        body: 'Put the end-to-end patient and clinician journeys on a wall in the office.',
      },
      {
        lead: 'Form a point of view.',
        body: "Return to the founders with an assessment of the organization, its biggest constraints, the highest-leverage opportunities, and what I'd change first.",
      },
    ],
  },
  {
    heading: "Why I'm equipped to do this",
    items: [
      {
        body: 'Reported to a founder for 5+ years, balancing exposure to company-level strategy with the details of shipping product. Hired, managed, and developed five PMs. Also managed six different engineers.',
      },
      {
        body: 'Improved conversion by 1,000 basis points while revenue grew more than 10x during my tenure.',
      },
      {
        body: 'Built products automating complex healthcare workflows for pharmacists and healthcare admins.',
      },
      {
        body: (
          <>
            Shipped dozens of features as a fractional product builder at a four-person,
            $4M-funded seed stage startup with 40K MAUs, contributing to a 20% lift in D30
            retention. (
            <a
              href="https://unvale.io"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Unvale.io
            </a>
            )
          </>
        ),
      },
    ],
  },
];

export default function ScalingTheProductOrgPage() {
  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-start px-6 pt-32 pb-24">
        <article className="max-w-2xl w-full">
          <Link
            href="/writing-samples"
            className="inline-block text-sm text-gray-500 hover:text-foreground transition-colors mb-8"
          >
            <span aria-hidden>←</span> Writing
          </Link>
          <header className="mb-12">
            <h1 className="text-xl font-medium tracking-tight leading-snug text-balance mb-3">
              {TITLE}
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">{SUBTITLE}</p>
          </header>

          {sections.map((section) => (
            <section key={section.heading} className="mb-12 last:mb-0">
              <h2 className="text-sm font-medium mb-4">{section.heading}</h2>
              {section.intro && (
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{section.intro}</p>
              )}
              <ul className="list-disc pl-5 space-y-3 marker:text-gray-400">
                {section.items.map((item, i) => (
                  <li key={i} className="pl-1 text-sm text-gray-600 leading-relaxed">
                    {item.lead && (
                      <>
                        <strong className="font-medium text-foreground">{item.lead}</strong>{' '}
                      </>
                    )}
                    {item.body}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </article>
      </main>
    </div>
  );
}
