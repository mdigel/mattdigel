/**
 * Feature Flags Configuration
 * 
 * Toggle between two end-of-quiz scenarios:
 * - true: Quiz → Calendly (book a call)
 * - false: Quiz → Products Accordion
 */

const featureFlags = {
  // Set to true: Quiz leads to Calendly booking
  // Set to false: Quiz leads to Products accordion
  showCalendlyAfterQuiz: false,
};

export default featureFlags;

