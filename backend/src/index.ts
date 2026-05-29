import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { ItineraryDay, TravelRequest, calculateDailyExpenses } from './itinerary';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2:3b';

app.use(cors());
app.use(express.json());

app.get('/', (_, res) => {
  res.json({
    message: 'intelliTrip Backend API',
    version: '0.2.0',
    aiProvider: 'ollama',
    endpoints: {
      'GET /api/ping': 'Health check',
      'POST /api/itinerary': 'Generate travel itinerary with Ollama',
      'GET /api/debug': 'AI configuration details',
    },
  });
});

app.get('/api/ping', (_, res) => {
  res.json({ ok: true, service: 'intelliTrip-backend' });
});

app.get('/api/debug', (_, res) => {
  res.json({
    aiEnabled: true,
    aiSource: 'ollama',
    ollamaHost,
    ollamaModel,
    placesApiSource: 'openstreetmap',
    timestamp: new Date().toISOString(),
    version: '0.2.0',
  });
});

app.post('/api/itinerary', async (req, res) => {
  const body = req.body as TravelRequest;

  if (
    !body.destinations ||
    body.destinations.length === 0 ||
    !body.destinations[0].city ||
    !body.origin ||
    !body.origin.city ||
    !body.tripLength ||
    !body.interests
  ) {
    return res.status(400).json({
      error: 'destinations[0].city, origin.city, tripLength, and interests are required',
    });
  }

  try {
    const result = await generateOllamaItinerary(body);
    return res.json({
      ...result,
      source: 'ollama',
      debug: {
        aiEnabled: true,
        aiSource: 'ollama',
        model: ollamaModel,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate itinerary';
    console.error('Itinerary generation error:', errorMessage);
    const isOllamaError = /ollama|unable to reach|timed out|did not contain|did not include|unable to parse/i.test(errorMessage);
    const statusCode = isOllamaError ? 502 : 500;

    return res.status(statusCode).json({
      error: {
        message: errorMessage,
        source: 'ollama',
      },
      debug: {
        aiEnabled: true,
        aiSource: 'ollama',
        model: ollamaModel,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

app.listen(port, () => {
  console.log(`intelliTrip backend running on http://localhost:${port}`);
  console.log(`Ollama model: ${ollamaModel}`);
});

async function generateOllamaItinerary(
  request: TravelRequest
): Promise<{ itinerary: ItineraryDay[]; totalPrice: number; flightPrice: number; hotelPerNight: number; totalHotel: number }> {
  const destination = request.destinations[0];
  const destinationText = `${destination.city}${destination.country ? `, ${destination.country}` : ''}`;
  const originText = `${request.origin.city}${request.origin.state ? `, ${request.origin.state}` : ''}${request.origin.country ? `, ${request.origin.country}` : ''}`;
  const activitiesPerDay = request.travelStyle === 'relaxed' ? 2 : request.travelStyle === 'packed' ? 4 : 3;

  const placeCategories = await fetchCategorizedPlaces(destination.city);
  const placesPromptText = buildPlacesPromptText(destinationText, placeCategories);

  const prompt = `
You are a travel planning assistant with access to real destination information from a places API.

Here are real places in ${destinationText}:
${placesPromptText}

STRICT RULES:
- You MUST use these real places when generating the itinerary.
- You may add other real places if needed, but only if they are actual venues.
- DO NOT use generic phrases like "culture experience", "food experience", "outdoor activity", or "local attraction".
- Each activity must include:
  - time
  - title (specific, includes place name)
  - description
  - location (actual place name)
  - estimatedPrice (number)
- Use real venue names for 'location', and make the 'title' clearly reference the same place.
- Do NOT repeat the same major landmark, museum, palace, cruise, restaurant, or neighborhood experience on a later day (one visit per venue for the whole trip).

CRITICAL — day count:
- The "itinerary" array MUST contain exactly ${request.tripLength} objects: one per calendar day, with "day" running from 1 through ${request.tripLength}.
- Do NOT return a single combined day. Do NOT omit days. If the trip is ${request.tripLength} days long, output ${request.tripLength} separate day entries with different activities.

CRITICAL — activities per day for this travel style ("${request.travelStyle}"):
- Each day object MUST include exactly ${activitiesPerDay} entries in its "activities" array (not fewer, not spread across days).
- relaxed → 2 activities/day; packed → 4; luxury → 3; budget → 3.

Return ONLY valid JSON in this exact format:

{
  "itinerary": [
    {
      "day": 1,
      "summary": "short summary",
      "activities": [
        {
          "time": "09:00",
          "title": "Visit Louvre Museum",
          "description": "Explore famous artworks including the Mona Lisa",
          "location": "Louvre Museum",
          "estimatedPrice": 20,
          "type": "activity"
        }
      ]
    },
    {
      "day": 2,
      "summary": "another day",
      "activities": [
        {
          "time": "10:00",
          "title": "Walk Seine riverbank",
          "description": "Scenic stroll",
          "location": "Seine",
          "estimatedPrice": 0,
          "type": "activity"
        }
      ]
    }
  ]
}

Trip details:
Destination: ${request.destinations[0].city}
Days: ${request.tripLength} (you must output exactly this many day entries)
Interests: ${request.interests.join(", ")}
Travel Style: ${request.travelStyle}

If you cannot produce a valid itinerary that follows these rules, return an error message instead of fallback output.
`;

  let itinerary: ItineraryDay[];
  const numPredict = Math.min(16384, Math.max(4096, 1600 + request.tripLength * 1800));
  try {
    const raw = await generateOllamaTextWithRetry(prompt, 1, { numPredict });
    console.log(`[DEBUG] Ollama raw response for ${request.tripLength} days:`, raw.substring(0, 500) + '...');
    itinerary = parseAndValidateItinerary(raw, request, activitiesPerDay);
    console.log(`[DEBUG] Parsed itinerary length: ${itinerary.length} (requested: ${request.tripLength})`);
    itinerary = await fillMissingItineraryDays(
      itinerary,
      request,
      activitiesPerDay,
      destinationText,
      placesPromptText,
      numPredict
    );
    sortAllDaysByActivityTime(itinerary);
    for (let round = 0; round < 5; round++) {
      stripGlobalDuplicateActivities(itinerary);
      if (!itinerary.some((d) => d.activities.length < activitiesPerDay)) {
        break;
      }
      await ensureMinimumActivitiesPerDay(
        itinerary,
        request,
        activitiesPerDay,
        destinationText,
        placesPromptText
      );
    }
    sortAllDaysByActivityTime(itinerary);
    stripGlobalDuplicateActivities(itinerary);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to generate itinerary from Ollama.';
    throw new Error(message);
  }

  itinerary.forEach((day) => {
    day.dailyExpenses = calculateDailyExpenses(destination, request.budget, request.travelStyle, day.activities.length);
  });

  const activityTotal = itinerary.reduce(
    (sum, day) => sum + day.activities.reduce((daySum, act) => daySum + (Number(act.estimatedPrice) || 0), 0),
    0
  );
  const dailyExpensesTotal = itinerary.reduce((sum, day) => sum + (day.dailyExpenses?.total || 0), 0);
  const flightPrice = estimateFlightPrice(request.origin, destination, request.budget);
  const hotelPerNight = estimateHotelPrice(request.budget);
  const totalHotel = hotelPerNight * request.tripLength;
  const totalPrice = activityTotal + dailyExpensesTotal + flightPrice + totalHotel;

  return { itinerary, totalPrice, flightPrice, hotelPerNight, totalHotel };
}

async function fillMissingItineraryDays(
  existing: ItineraryDay[],
  request: TravelRequest,
  activitiesPerDay: number,
  destinationText: string,
  placesPromptText: string,
  numPredict: number
): Promise<ItineraryDay[]> {
  const itinerary = existing.slice(0, request.tripLength);
  let guard = 0;
  while (itinerary.length < request.tripLength && guard < request.tripLength + 4) {
    guard += 1;
    const dayNum = itinerary.length + 1;
    const priorSummaries = itinerary
      .map(
        (d) =>
          `Day ${d.day}: ${d.summary} — ${d.activities.map((a) => a.title).slice(0, 4).join('; ')}`
      )
      .join('\n');
    const contPrompt = `
You are continuing a travel itinerary for ${destinationText}.
Real places to choose from:
${placesPromptText}

Already planned:
${priorSummaries}

STRICT RULES:
- Use the real places listed above; include venue names in title and location.
- Output ONLY the next calendar day: day ${dayNum} of ${request.tripLength} total. Do not repeat earlier days.
- Do NOT reuse any landmark, venue, or cruise already used on a previous day of this trip (one time per place for the whole itinerary).
- Each activity: time, title, description, location, estimatedPrice (number).
- Include exactly ${activitiesPerDay} activities for this day (same count as the main itinerary rules for this travel style).

Return JSON only in this shape:
{"itinerary":[{"day":${dayNum},"summary":"...","activities":[...]}]}
`;
    const raw = await generateOllamaTextWithRetry(contPrompt, 1, {
      numPredict: Math.min(numPredict, 8192),
      temperature: 0.55,
    });
    const next = parseAndValidateItinerary(raw, request, activitiesPerDay, 1);
    if (!next.length) {
      throw new Error(`Ollama did not return a valid day ${dayNum} itinerary.`);
    }
    const dayBlock = next[0];
    dayBlock.day = dayNum;
    itinerary.push(dayBlock);
  }
  if (itinerary.length < request.tripLength) {
    throw new Error(
      `Itinerary only has ${itinerary.length} day(s) but the trip is ${request.tripLength} days. Try again or use a larger Ollama model.`
    );
  }
  return itinerary;
}

async function ensureMinimumActivitiesPerDay(
  itinerary: ItineraryDay[],
  request: TravelRequest,
  activitiesPerDay: number,
  destinationText: string,
  placesPromptText: string
): Promise<void> {
  for (const day of itinerary) {
    let attempts = 0;
    while (day.activities.length < activitiesPerDay && attempts < 8) {
      attempts += 1;
      const need = activitiesPerDay - day.activities.length;
      const existingLines = day.activities
        .map((a) => `- ${a.time} | ${a.title} | ${a.location}`)
        .join('\n');
      const bookedElsewhere = itinerary
        .filter((d) => d.day !== day.day)
        .flatMap((d) => d.activities.map((a) => `- ${a.title} | ${a.location}`))
        .join('\n');
      const prompt = `
Add activities for ${destinationText}, day ${day.day} of ${request.tripLength}.
Travel style: ${request.travelStyle} — this day must end with exactly ${activitiesPerDay} activities total.

Real places (prefer these venues; pick different ones than already used):
${placesPromptText}

Day summary: ${day.summary}

BOOKED ON OTHER DAYS — never repeat these venues or the same major activity type (same palace, same strait cruise, same museum, etc.):
${bookedElsewhere || '(none)'}

ALREADY ON THIS DAY — keep these; add only new items:
${existingLines || '(none yet)'}

Return ONLY valid JSON:
{"activities":[
  {"time":"HH:MM","title":"...","description":"...","location":"...","estimatedPrice":0}
]}

The "activities" array MUST contain exactly ${need} new items. Use varied times through the day (morning, lunch, afternoon, evening).
`;
      const raw = await generateOllamaTextWithRetry(prompt, 0, {
        numPredict: Math.min(4096, 320 + need * 450),
        temperature: 0.45,
      });
      const rawItems = parseActivitiesExtensionPayload(raw);
      const startIdx = day.activities.length;
      const normalizedBatch = rawItems
        .slice(0, need + 2)
        .map((item, i) => normalizeActivity(item, startIdx + i + 1))
        .filter((a) => a.title.length > 0 && a.location.length > 0);

      const tripContext = tripActivitiesForDedupe(itinerary, day.day);
      let added = 0;
      for (const act of normalizedBatch) {
        if (day.activities.length >= activitiesPerDay) break;
        if (isDuplicateTripActivity(act, tripContext)) continue;
        day.activities.push(act);
        tripContext.push(act);
        added += 1;
      }
      if (added === 0) {
        break;
      }
    }
  }
}

type OllamaGenOptions = { numPredict?: number; temperature?: number };

async function generateOllamaTextWithRetry(
  prompt: string,
  retries: number,
  genOptions?: OllamaGenOptions
): Promise<string> {
  const temperature = genOptions?.temperature ?? 0.7;
  const numPredict = genOptions?.numPredict;
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      const response = await fetch(`${ollamaHost}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: ollamaModel,
          prompt,
          stream: false,
          format: 'json',
          options: {
            temperature,
            ...(typeof numPredict === 'number' ? { num_predict: numPredict } : {}),
          },
        }),
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Ollama request failed (${response.status}). Check that Ollama is running and the model is available.`);
      }

      const payload = (await response.json()) as { response?: string };
      const raw = payload.response?.trim();
      if (!raw) {
        throw new Error('Ollama returned an empty response');
      }
      return raw;
    } catch (error) {
      lastError = error;
      if (attempt <= retries) continue;
    }
  }

  const message = lastError instanceof Error ? lastError.message : 'Unknown Ollama request failure';
  if (message.toLowerCase().includes('fetch failed')) {
    throw new Error(`Unable to reach Ollama at ${ollamaHost}. Install/start Ollama and ensure model "${ollamaModel}" is pulled.`);
  }
  if (message.toLowerCase().includes('abort')) {
    throw new Error(`Ollama request timed out after 60s using model "${ollamaModel}". Try a smaller model or retry.`);
  }
  throw new Error(`Unable to generate itinerary from Ollama: ${message}`);
}

function parseAndValidateItinerary(
  raw: string,
  request: TravelRequest,
  activitiesPerDay: number,
  daySliceLimit?: number
): ItineraryDay[] {
  let parsed: unknown[];
  try {
    parsed = parseItineraryPayload(raw);
  } catch (parseError) {
    const message = parseError instanceof Error ? parseError.message : 'Unable to parse Ollama itinerary JSON';
    throw new Error(message);
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Ollama response did not contain a usable itinerary format');
  }

  const sliceLimit = daySliceLimit ?? request.tripLength;
  const normalized = parsed.slice(0, sliceLimit).map((day, index) => {
    const safeDay = typeof day === 'object' && day !== null ? (day as Record<string, unknown>) : {};
    const activitiesRaw = collectActivitiesFromDay(safeDay);
    const activities = activitiesRaw
      .slice(0, activitiesPerDay)
      .map((activity, activityIndex) => normalizeActivity(activity, activityIndex + 1))
      .filter((activity) => activity.title.length > 0 && activity.location.length > 0);

    if (activities.length === 0) {
      throw new Error('Ollama response did not provide any valid itinerary activities.');
    }

    const dailyExpenses = normalizeDailyExpenses(
      safeDay.dailyExpenses,
      request.destinations[0],
      request.budget,
      request.travelStyle,
      activities.length
    );

    return {
      day: index + 1,
      summary: toSafeString(safeDay.summary, `Day ${index + 1} itinerary`),
      activities,
      dailyExpenses,
    };
  });

  if (normalized.length === 0) {
    throw new Error('No valid itinerary days were produced after validation');
  }
  return normalized;
}

function parseItineraryPayload(raw: string): unknown[] {
  const parsed = parseJsonArray(raw);
  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>;
    const candidate =
      (Array.isArray(obj.itinerary) && obj.itinerary) ||
      (Array.isArray(obj.days) && obj.days) ||
      (Array.isArray(obj.plan) && obj.plan);
    if (candidate) {
      return candidate;
    }
  }
  throw new Error('Ollama response did not include an itinerary array');
}

function parseJsonArray(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    // Fall through to extraction.
  }

  const objectMatch = raw.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0]);
    } catch {
      // Continue to array extraction.
    }
  }

  const arrayMatch = raw.match(/\[[\s\S]*\]/);
  if (!arrayMatch) {
    throw new Error('Could not find valid JSON in Ollama response');
  }

  return JSON.parse(arrayMatch[0]);
}

function parseActivitiesExtensionPayload(raw: string): unknown[] {
  const parsed = parseJsonArray(raw);
  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (parsed && typeof parsed === 'object') {
    const o = parsed as Record<string, unknown>;
    if (Array.isArray(o.activities)) {
      return o.activities;
    }
    if (Array.isArray(o.itinerary) && o.itinerary[0] && typeof o.itinerary[0] === 'object') {
      const d0 = o.itinerary[0] as Record<string, unknown>;
      if (Array.isArray(d0.activities)) {
        return d0.activities;
      }
    }
  }
  return [];
}

function activityDedupeKey(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9\u00C0-\u024f\s]/gi, '')
    .trim();
}

function foldAscii(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

/** Same physical site / experience across different wording (EN/TR) or address strings. */
function landmarkCanonicalId(title: string, location: string): string | null {
  const x = foldAscii(`${title} ${location}`).replace(/\s+/g, ' ');
  if (/topkapi|topkap[iı]/.test(x) && (/palace|saray|museum|harem/.test(x))) {
    return 'site:topkapi';
  }
  if ((/hagia|ayasofya|aya\s*sofya/.test(x) || /ayasofya/.test(x)) && (/sophia|ayasofya|mosque|camii|museum|ayasofia/.test(x))) {
    return 'site:hagia_sophia';
  }
  if ((/basilica/.test(x) && /cistern/.test(x)) || /yerebatan/.test(x)) {
    return 'site:basilica_cistern';
  }
  if (/bosphorus|bosporus|bogazici|bogaziçi|istanbul\s*boğaz|bogaz|boğaz/.test(x)) {
    return 'site:bosphorus_corridor';
  }
  if (/grand/.test(x) && (/bazaar|çarşı|carsi|kapalı/.test(x))) {
    return 'site:grand_bazaar';
  }
  if (/galata/.test(x) && (/tower|kule/.test(x))) {
    return 'site:galata_tower';
  }
  if ((/blue/.test(x) && /mosque/.test(x)) || /sultanahmet\s*mosque/.test(x)) {
    return 'site:blue_mosque';
  }
  const t = foldAscii(title);
  const blob = foldAscii(`${title} ${location}`);
  if (/\bistanbul\s+restaurant\b/.test(t) || /\bistanbul\s+restaurant\b/.test(blob)) {
    return 'chain:istanbul_restaurant';
  }
  return null;
}

const DEDUP_STOP = new Set(
  'the a an and or for of to in on at from with into by tour city walk drive see visit lunch dinner breakfast brunch explore enjoy take ride boat trip taxi museum gallery park beach plaza square market mall center centre district downtown uptown historic historical famous iconic stunning beautiful cozy authentic traditional classic locale your our this that these those any all strait cruise departure point pier dock experience discover admire browse savor indulge meal food cuisine setting atmosphere views skyline historic'.split(
    /\s+/
  )
);

const GEO_STOP = new Set(
  'istanbul i̇stanbul turkey turkiye türkiye fatih marmara mimar hayrettin mahallesi sultanahmet gebze bölgesi region province postal avenue street road caddesi europe asia marmara'.split(/\s+/)
);

function significantWords(title: string, loc: string): string[] {
  const parts = activityDedupeKey(`${title} ${loc}`).split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (const p of parts) {
    const w = foldAscii(p);
    if (w.length < 5) continue;
    if (DEDUP_STOP.has(w) || GEO_STOP.has(w)) continue;
    out.push(w);
  }
  return [...new Set(out)];
}

const NEIGHBORHOOD_TOKENS = new Set(
  'sultanahmet beyoglu kadikoy üsküdar uskudar besiktas beşiktas fatih eminonu eminönü karakoy karaköy ortaköy ortakoy'.split(/\s+/)
);

function tokenBagOverlap(a: ItineraryDay['activities'][number], b: ItineraryDay['activities'][number]): boolean {
  const sa = significantWords(a.title, a.location);
  const sb = significantWords(b.title, b.location);
  if (sa.length === 0 || sb.length === 0) return false;
  const setB = new Set(sb);
  const overlap = sa.filter((x) => setB.has(x));
  if (overlap.length >= 2) return true;
  if (overlap.length === 1) {
    const w = overlap[0];
    if (!NEIGHBORHOOD_TOKENS.has(w) && w.length >= 10) return true;
  }
  for (const x of sa) {
    if (x.length < 7) continue;
    for (const y of sb) {
      if (y.length < 7) continue;
      if (x !== y && (x.includes(y) || y.includes(x))) return true;
    }
  }
  return false;
}

function isDuplicateTripActivity(
  act: ItineraryDay['activities'][number],
  existing: ItineraryDay['activities']
): boolean {
  if (existing.length === 0) return false;
  const id = landmarkCanonicalId(act.title, act.location);
  const locKey = activityDedupeKey(act.location);
  const titleKey = activityDedupeKey(act.title);
  for (const e of existing) {
    const eid = landmarkCanonicalId(e.title, e.location);
    if (id && eid && id === eid) return true;
    const el = activityDedupeKey(e.location);
    const et = activityDedupeKey(e.title);
    if (locKey.length >= 10 && el.length >= 10 && (locKey === el || locKey.includes(el) || el.includes(locKey))) {
      return true;
    }
    if (titleKey.length >= 14 && et.length >= 14 && (titleKey === et || titleKey.includes(et) || et.includes(titleKey))) {
      return true;
    }
    if (locKey.length >= 8 && el.length >= 8 && (locKey === el || locKey.includes(el) || el.includes(locKey))) {
      return true;
    }
    if (titleKey.length >= 10 && et.length >= 10 && (titleKey.includes(et) || et.includes(titleKey))) {
      return true;
    }
    if (tokenBagOverlap(act, e)) return true;
  }
  return false;
}

function tripActivitiesForDedupe(itinerary: ItineraryDay[], currentDayNum: number): ItineraryDay['activities'] {
  const others = itinerary.filter((d) => d.day !== currentDayNum).flatMap((d) => d.activities);
  const self = itinerary.find((d) => d.day === currentDayNum)?.activities ?? [];
  return [...others, ...self];
}

function timeToSortMinutes(t: string): number {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return 24 * 60 + 1;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function sortAllDaysByActivityTime(itinerary: ItineraryDay[]): void {
  for (const day of itinerary) {
    day.activities.sort((a, b) => timeToSortMinutes(a.time) - timeToSortMinutes(b.time));
  }
}

function stripGlobalDuplicateActivities(itinerary: ItineraryDay[]): void {
  const seen: ItineraryDay['activities'] = [];
  for (const day of itinerary) {
    day.activities = day.activities.filter((act) => {
      if (isDuplicateTripActivity(act, seen)) return false;
      seen.push(act);
      return true;
    });
  }
}

function collectActivitiesFromDay(day: Record<string, unknown>): unknown[] {
  if (Array.isArray(day.activities)) {
    return day.activities;
  }

  if (day.activities && typeof day.activities === 'object') {
    return Object.values(day.activities as Record<string, unknown>);
  }

  if (Array.isArray(day.stops)) {
    return day.stops;
  }

  if (Array.isArray(day.items)) {
    return day.items;
  }

  return [];
}

function normalizeActivity(input: unknown, index: number): ItineraryDay['activities'][number] {
  if (typeof input === 'string') {
    const title = input.trim();
    return {
      time: normalizeTime(undefined, index),
      title: title.length > 0 ? title : `Activity ${index}`,
      description: 'No description provided.',
      location: 'Location not specified',
      estimatedPrice: 0,
    };
  }

  const safe = typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {};
  const titleValue = safe.title ?? safe.name ?? safe.activity;
  const descriptionValue = safe.description ?? safe.details ?? safe.notes;
  const locationValue = safe.location ?? safe.place ?? safe.venue;
  const priceValue = safe.estimatedPrice ?? safe.price ?? safe.cost;

  return {
    time: normalizeTime(safe.time, index),
    title: toSafeString(titleValue, `Activity ${index}`),
    description: toSafeString(descriptionValue, 'No description provided.'),
    location: toSafeString(locationValue, 'Location not specified'),
    estimatedPrice: toPositiveNumber(priceValue, 0),
  };
}

function normalizeDailyExpenses(
  input: unknown,
  destination: { city: string; country?: string },
  budget: string,
  travelStyle: string,
  activityCount: number
): ItineraryDay['dailyExpenses'] {
  const fallback = calculateDailyExpenses(destination, budget, travelStyle, activityCount);
  const safe = typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {};
  const travel = toPositiveNumber(safe.travel, fallback.travel);
  const food = toPositiveNumber(safe.food, fallback.food);
  const miscellaneous = toPositiveNumber(safe.miscellaneous, fallback.miscellaneous);
  const total = toPositiveNumber(safe.total, travel + food + miscellaneous);
  return { travel, food, miscellaneous, total };
}

function toSafeString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

function toPositiveNumber(value: unknown, fallback: number): number {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return fallback;
  return Math.round(num);
}

function normalizeTime(value: unknown, index: number): string {
  if (typeof value === 'string' && /^\d{2}:\d{2}$/.test(value.trim())) {
    return value.trim();
  }
  const fallbackHour = Math.min(8 + index * 2, 22);
  return `${String(fallbackHour).padStart(2, '0')}:00`;
}

function normalizeLocation(value?: string): string {
  return value?.trim().toLowerCase() || '';
}

async function fetchTopPlaces(query: string, altNames: string[], expectedCountry: string): Promise<string[]> {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=10&addressdetails=1`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'intelliTrip/1.0 (https://github.com/your-repo/intelliTrip)',
    },
  });

  if (!response.ok) {
    throw new Error(`OpenStreetMap Nominatim request failed with status ${response.status}`);
  }

  const data = (await response.json()) as Array<{
    display_name?: string;
    type?: string;
    address?: { city?: string; town?: string; village?: string; state?: string; country?: string };
  }>;

  return data
    .filter((place) => {
      if (!place.display_name || place.type === 'administrative') return false;

      const displayName = place.display_name.toLowerCase();
      const addressCity = place.address?.city?.toLowerCase() || place.address?.town?.toLowerCase() || place.address?.village?.toLowerCase() || '';
      const addressCountry = place.address?.country?.toLowerCase() || '';

      // Filter for places that contain any of the alternative city names AND match expected country
      const cityMatch = altNames.some(altName =>
        displayName.includes(altName) || addressCity.includes(altName)
      );

      // Handle country name variations (e.g., Italia/Italy, España/Spain)
      const countryVariations: Record<string, string[]> = {
        'italy': ['italy', 'italia'],
        'spain': ['spain', 'españa'],
        'france': ['france'],
        'germany': ['germany', 'deutschland'],
        'united kingdom': ['united kingdom', 'uk'],
        'united states': ['united states', 'usa'],
        'japan': ['japan'],
        'netherlands': ['netherlands', 'nederland'],
        'czech republic': ['czech republic'],
        'greece': ['greece', 'ελλάδα', 'ελλάς', 'hellas']
      };

      const expectedCountryVariations = countryVariations[expectedCountry.toLowerCase()] || [expectedCountry.toLowerCase()];
      const countryMatch = !expectedCountry || expectedCountryVariations.some(variation =>
        addressCountry.includes(variation)
      );

      return cityMatch && countryMatch;
    })
    .map((place) => place.display_name!)
    .filter((name) => name.trim().length > 0)
    .slice(0, 6);
}

async function fetchCategorizedPlaces(city: string): Promise<Record<string, string[]>> {
  // Map major cities to their countries and alternative names for better filtering
  const cityInfoMap: Record<string, { country: string; altNames: string[] }> = {
    'paris': { country: 'france', altNames: ['paris'] },
    'rome': { country: 'italy', altNames: ['rome', 'roma'] },
    'london': { country: 'united kingdom', altNames: ['london'] },
    'tokyo': { country: 'japan', altNames: ['tokyo'] },
    'new york': { country: 'united states', altNames: ['new york'] },
    'barcelona': { country: 'spain', altNames: ['barcelona'] },
    'amsterdam': { country: 'netherlands', altNames: ['amsterdam'] },
    'berlin': { country: 'germany', altNames: ['berlin'] },
    'madrid': { country: 'spain', altNames: ['madrid'] },
    'prague': { country: 'czech republic', altNames: ['prague'] },
    'athens': { country: 'greece', altNames: ['athens', 'athina', 'αθήνα', 'athina'] }
  };

  const cityLower = city.toLowerCase();
  const cityInfo = cityInfoMap[cityLower] || { country: '', altNames: [cityLower] };

  const categories = [
    { label: 'Top attractions', query: `${city} tourist attraction` },
    { label: 'Museums', query: `${city} museum` },
    { label: 'Restaurants', query: `${city} restaurant` },
    { label: 'Parks', query: `${city} park` },
  ];

  const results: Record<string, string[]> = {};
  for (const category of categories) {
    results[category.label] = await fetchTopPlaces(category.query, cityInfo.altNames, cityInfo.country);
  }
  return results;
}

function buildPlacesPromptText(destination: string, categories: Record<string, string[]>): string {
  const lines: string[] = [];
  for (const [label, places] of Object.entries(categories)) {
    if (places.length === 0) continue;
    lines.push(`${label}:`);
    lines.push(...places.map((place) => `- ${place}`));
    lines.push('');
  }
  if (lines.length === 0) {
    throw new Error(`Unable to fetch real places for ${destination}. Check your internet connection and destination spelling.`);
  }
  return lines.join('\n').trim();
}

function estimateFlightPrice(
  origin: { city: string; state?: string; country?: string },
  destination: { city: string; country?: string },
  budget: string
): number {
  const budgetMultiplier = budget === 'luxury' ? 1.3 : budget === 'budget' ? 0.85 : 1;
  const domestic = normalizeLocation(origin.country) && normalizeLocation(origin.country) === normalizeLocation(destination.country);
  const base = domestic ? 180 : 760;
  return Math.round(base * budgetMultiplier);
}

function estimateHotelPrice(budget: string): number {
  const base = budget === 'luxury' ? 220 : budget === 'budget' ? 70 : 130;
  return base;
}
