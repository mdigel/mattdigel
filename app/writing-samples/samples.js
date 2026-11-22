// Add new writing samples here (newest first). Each one also needs a page at
// app/writing-samples/<slug>/page.js.
export const samples = [
  {
    slug: 'scaling-the-product-org',
    title: "How I'd scale product at a growth-stage startup",
    description: "My philosophy, how I'd lead, and where I'd start.",
  },
];

export function getSample(slug) {
  return samples.find((sample) => sample.slug === slug);
}
