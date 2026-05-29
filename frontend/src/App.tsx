import { FormEvent, useState, useEffect } from 'react';
import { countries, Country, State } from './locations';

type ItineraryActivity = {
  time: string;
  title: string;
  description: string;
  location: string;
  estimatedPrice: number;
};

type ItineraryDay = {
  day: number;
  summary: string;
  activities: ItineraryActivity[];
};

type Destination = {
  country: string;
  state: string;
  city: string;
};

const travelStyles = ['relaxed', 'packed', 'luxury', 'budget'] as const;
const budgetOptions = ['budget', 'midrange', 'luxury'] as const;

function App() {
  // Origin
  const [originCountry, setOriginCountry] = useState<string>('US');
  const [originState, setOriginState] = useState<string>('NY');
  const [originCity, setOriginCity] = useState<string>('New York City');

  // Destinations (multiple)
  const [destinations, setDestinations] = useState<Destination[]>([
    { country: 'FR', state: '', city: 'Paris' }
  ]);
  const [tripLength, setTripLength] = useState(3);
  const [budget, setBudget] = useState<typeof budgetOptions[number]>('midrange');
  const [interests, setInterests] = useState('culture, food, outdoors');
  const [travelStyle, setTravelStyle] = useState<typeof travelStyles[number]>('relaxed');
  const [itinerary, setItinerary] = useState<ItineraryDay[] | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [flightPrice, setFlightPrice] = useState<number | null>(null);
  const [hotelPerNight, setHotelPerNight] = useState<number | null>(null);
  const [totalHotel, setTotalHotel] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get selected country objects
  const selectedOriginCountry = countries.find(c => c.code === originCountry);

  // Available states/cities
  const originStates = selectedOriginCountry?.states || [];
  const originCities = selectedOriginCountry?.hasStates
    ? originStates.find(s => s.code === originState)?.cities || []
    : selectedOriginCountry?.cities || [];

  // Reset state/city when country changes
  useEffect(() => {
    if (selectedOriginCountry?.hasStates && originStates.length > 0) {
      setOriginState(originStates[0].code);
      setOriginCity(originStates[0].cities[0]);
    } else if (!selectedOriginCountry?.hasStates && selectedOriginCountry?.cities) {
      setOriginState('');
      setOriginCity(selectedOriginCountry.cities[0]);
    }
  }, [originCountry]);

  // Reset city when state changes
  useEffect(() => {
    const currentState = originStates.find(s => s.code === originState);
    if (currentState && currentState.cities.length > 0) {
      setOriginCity(currentState.cities[0]);
    }
  }, [originState]);

  // Helper functions for destination management
  const getDestinationCountry = (index: number) => countries.find(c => c.code === destinations[index].country);
  const getDestinationStates = (index: number) => getDestinationCountry(index)?.states || [];
  const getDestinationCities = (index: number) => {
    const country = getDestinationCountry(index);
    if (!country) return [];
    return country.hasStates
      ? getDestinationStates(index).find(s => s.code === destinations[index].state)?.cities || []
      : country.cities || [];
  };

  const updateDestination = (index: number, field: keyof Destination, value: string) => {
    const updated = [...destinations];
    updated[index] = { ...updated[index], [field]: value };
    
    // Reset state/city when country changes
    if (field === 'country') {
      const country = countries.find(c => c.code === value);
      if (country?.hasStates && country.states && country.states.length > 0) {
        updated[index].state = country.states[0].code;
        updated[index].city = country.states[0].cities[0];
      } else if (!country?.hasStates && country?.cities && country.cities.length > 0) {
        updated[index].state = '';
        updated[index].city = country.cities[0];
      }
    }
    
    // Reset city when state changes
    if (field === 'state') {
      const country = countries.find(c => c.code === updated[index].country);
      const state = country?.states?.find(s => s.code === value);
      if (state && state.cities.length > 0) {
        updated[index].city = state.cities[0];
      }
    }
    
    setDestinations(updated);
  };

  const addDestination = () => {
    setDestinations([...destinations, { country: 'FR', state: '', city: 'Paris' }]);
  };

  const removeDestination = (index: number) => {
    if (destinations.length > 1) {
      setDestinations(destinations.filter((_, i) => i !== index));
    }
  };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const destinationArray = destinations.map(dest => ({
        city: dest.city,
        country: countries.find(c => c.code === dest.country)?.name
      }));

      const response = await fetch('http://localhost:4000/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinations: destinationArray,
          origin: {
            city: originCity,
            state: selectedOriginCountry?.hasStates ? originState : undefined,
            country: selectedOriginCountry?.name
          },
          tripLength,
          budget,
          interests: interests.split(',').map((item) => item.trim()).filter(Boolean),
          travelStyle,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        const err = data?.error as string | { message?: string } | undefined;
        const backendMessage =
          typeof err === 'string'
            ? err
            : err && typeof err === 'object' && typeof err.message === 'string'
              ? err.message
              : 'Failed to generate itinerary';
        throw new Error(backendMessage);
      }
      setItinerary(data.itinerary);
      setTotalPrice(data.totalPrice);
      setFlightPrice(data.flightPrice);
      setHotelPerNight(data.hotelPerNight);
      setTotalHotel(data.totalHotel);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <header>
        <h1>intelliTrip</h1>
        <p>Generate a personalized itinerary for your next trip.</p>
      </header>

      <main>
        <section className="form-panel">
          <form onSubmit={handleSubmit}>
            <fieldset>
              <legend>Origin</legend>
              <label>
                Country
                <select value={originCountry} onChange={(e) => setOriginCountry(e.target.value)}>
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                  ))}
                </select>
              </label>
              {selectedOriginCountry?.hasStates && (
                <label>
                  State
                  <select value={originState} onChange={(e) => setOriginState(e.target.value)}>
                    {originStates.map(state => (
                      <option key={state.code} value={state.code}>{state.name}</option>
                    ))}
                  </select>
                </label>
              )}
              <label>
                City
                <select value={originCity} onChange={(e) => setOriginCity(e.target.value)}>
                  {originCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </label>
            </fieldset>

            <fieldset>
              <legend>Destinations</legend>
              {destinations.map((dest, index) => {
                const selectedDestCountry = countries.find(c => c.code === dest.country);
                const destStates = getDestinationStates(index);
                const destCities = getDestinationCities(index);

                return (
                  <div key={index} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e0e0e0' }}>
                    <label>
                      Destination {index + 1} - Country
                      <select value={dest.country} onChange={(e) => updateDestination(index, 'country', e.target.value)}>
                        {countries.map(country => (
                          <option key={country.code} value={country.code}>{country.name}</option>
                        ))}
                      </select>
                    </label>
                    {selectedDestCountry?.hasStates && (
                      <label>
                        State
                        <select value={dest.state} onChange={(e) => updateDestination(index, 'state', e.target.value)}>
                          {destStates.map(state => (
                            <option key={state.code} value={state.code}>{state.name}</option>
                          ))}
                        </select>
                      </label>
                    )}
                    <label>
                      City
                      <select value={dest.city} onChange={(e) => updateDestination(index, 'city', e.target.value)}>
                        {destCities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </label>
                    {destinations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDestination(index)}
                        style={{ marginTop: '10px', padding: '5px 10px', backgroundColor: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Remove destination
                      </button>
                    )}
                  </div>
                );
              })}
              <button
                type="button"
                onClick={addDestination}
                style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                + Add destination
              </button>
            </fieldset>

            <label>
              Trip length (days)
              <input
                type="number"
                value={tripLength}
                min={1}
                max={14}
                onChange={(e) => setTripLength(Number(e.target.value))}
              />
            </label>

            <label>
              Budget
              <select value={budget} onChange={(e) => setBudget(e.target.value as typeof budgetOptions[number])}>
                {budgetOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Travel style
              <select value={travelStyle} onChange={(e) => setTravelStyle(e.target.value as typeof travelStyles[number])}>
                {travelStyles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Interests (comma-separated)
              <input value={interests} onChange={(e) => setInterests(e.target.value)} />
            </label>

            <button type="submit" disabled={loading}>
              {loading ? 'Generating...' : 'Generate itinerary'}
            </button>
          </form>

          {error && <div className="error">{error}</div>}
        </section>

        {itinerary && (
          <section className="results-panel">
            <h2>Your itinerary</h2>
            {itinerary.map((day) => (
              <article key={day.day} className="day-card">
                <h3>Day {day.day}</h3>
                <p>{day.summary}</p>
                <ul>
                  {day.activities.map((activity) => (
                    <li key={activity.time}>
                      <strong>{activity.time}</strong> — {activity.title} <span>({activity.location})</span>
                      <p>{activity.description}</p>
                      <p>Estimated cost: ${activity.estimatedPrice}</p>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
            {totalPrice && (
              <div className="cost-breakdown">
                <h3>Cost Breakdown</h3>
                <p>Flight: ${flightPrice}</p>
                <p>Hotel per night: ${hotelPerNight} (Total: ${totalHotel})</p>
                <p>Activities: ${totalPrice - (flightPrice || 0) - (totalHotel || 0)}</p>
                <p className="total-price">Total estimated cost: ${totalPrice}</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
