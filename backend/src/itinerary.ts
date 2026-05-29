export type TravelRequest = {
  destinations: { city: string; country?: string }[];
  origin: { city: string; state?: string; country?: string };
  tripLength: number;
  budget: string;
  interests: string[];
  travelStyle: 'relaxed' | 'packed' | 'luxury' | 'budget';
};

export type ItineraryActivity = {
  time: string;
  title: string;
  description: string;
  location: string;
  estimatedPrice: number;
  duration?: string; // e.g., "2-3 hours"
  type?: 'activity' | 'meal' | 'transport';
};

export type ItineraryDay = {
  day: number;
  summary: string;
  activities: ItineraryActivity[];
  dailyExpenses: {
    travel: number;
    food: number;
    miscellaneous: number;
    total: number;
  };
};

export function generateItinerary(request: TravelRequest): { itinerary: ItineraryDay[], totalPrice: number, flightPrice: number, hotelPerNight: number, totalHotel: number } {
  throw new Error('Local itinerary generation is disabled. intelliTrip uses Ollama for itinerary generation.');
}

export function calculateDailyExpenses(destination: { city: string; country?: string }, budget: string, travelStyle: string, activityCount: number) {
  const budgetMultipliers = {
    'luxury': 1.5,
    'midrange': 1.0,
    'budget': 0.6
  };
  const multiplier = budgetMultipliers[budget as keyof typeof budgetMultipliers] || 1.0;
  const travel = Math.round(12 * activityCount * multiplier);
  const food = Math.round(20 * multiplier);
  const miscellaneous = Math.round(12 * multiplier * (travelStyle === 'luxury' ? 1.6 : travelStyle === 'packed' ? 1.2 : 1));
  const total = travel + food + miscellaneous;

  return {
    travel,
    food,
    miscellaneous,
    total
  };
}
