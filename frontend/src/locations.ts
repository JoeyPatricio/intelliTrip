export interface Country {
  name: string;
  code: string;
  hasStates: boolean;
  states?: State[];
  cities?: string[];
}

export interface State {
  name: string;
  code: string;
  cities: string[];
}

export const countries: Country[] = [
  // North America
  {
    name: 'United States',
    code: 'US',
    hasStates: true,
    states: [
      { name: 'Alabama', code: 'AL', cities: ['Birmingham', 'Montgomery', 'Huntsville'] },
      { name: 'Alaska', code: 'AK', cities: ['Anchorage', 'Juneau', 'Fairbanks'] },
      { name: 'Arizona', code: 'AZ', cities: ['Phoenix', 'Tucson', 'Mesa', 'Scottsdale'] },
      { name: 'Arkansas', code: 'AR', cities: ['Little Rock', 'Fayetteville', 'Springdale'] },
      { name: 'California', code: 'CA', cities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento'] },
      { name: 'Colorado', code: 'CO', cities: ['Denver', 'Aurora', 'Boulder', 'Aspen'] },
      { name: 'Connecticut', code: 'CT', cities: ['Bridgeport', 'New Haven', 'Hartford'] },
      { name: 'Delaware', code: 'DE', cities: ['Wilmington', 'Dover'] },
      { name: 'Florida', code: 'FL', cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale'] },
      { name: 'Georgia', code: 'GA', cities: ['Atlanta', 'Augusta', 'Savannah'] },
      { name: 'Hawaii', code: 'HI', cities: ['Honolulu', 'Hilo', 'Kailua'] },
      { name: 'Idaho', code: 'ID', cities: ['Boise', 'Nampa', 'Pocatello'] },
      { name: 'Illinois', code: 'IL', cities: ['Chicago', 'Naperville', 'Aurora'] },
      { name: 'Indiana', code: 'IN', cities: ['Indianapolis', 'Fort Wayne', 'Evansville'] },
      { name: 'Iowa', code: 'IA', cities: ['Des Moines', 'Cedar Rapids', 'Davenport'] },
      { name: 'Kansas', code: 'KS', cities: ['Kansas City', 'Wichita', 'Topeka'] },
      { name: 'Kentucky', code: 'KY', cities: ['Louisville', 'Lexington', 'Bowling Green'] },
      { name: 'Louisiana', code: 'LA', cities: ['New Orleans', 'Baton Rouge', 'Lafayette'] },
      { name: 'Maine', code: 'ME', cities: ['Portland', 'Lewiston', 'Augusta'] },
      { name: 'Maryland', code: 'MD', cities: ['Baltimore', 'Annapolis', 'Ocean City'] },
      { name: 'Massachusetts', code: 'MA', cities: ['Boston', 'Worcester', 'Springfield'] },
      { name: 'Michigan', code: 'MI', cities: ['Detroit', 'Grand Rapids', 'Ann Arbor'] },
      { name: 'Minnesota', code: 'MN', cities: ['Minneapolis', 'St Paul', 'Rochester'] },
      { name: 'Mississippi', code: 'MS', cities: ['Jackson', 'Gulfport', 'Biloxi'] },
      { name: 'Missouri', code: 'MO', cities: ['Kansas City', 'St Louis', 'Springfield'] },
      { name: 'Montana', code: 'MT', cities: ['Billings', 'Missoula', 'Great Falls'] },
      { name: 'Nebraska', code: 'NE', cities: ['Omaha', 'Lincoln', 'Bellevue'] },
      { name: 'Nevada', code: 'NV', cities: ['Las Vegas', 'Henderson', 'Reno'] },
      { name: 'New Hampshire', code: 'NH', cities: ['Manchester', 'Nashua', 'Concord'] },
      { name: 'New Jersey', code: 'NJ', cities: ['Newark', 'Jersey City', 'Paterson'] },
      { name: 'New Mexico', code: 'NM', cities: ['Albuquerque', 'Santa Fe', 'Las Cruces'] },
      { name: 'New York', code: 'NY', cities: ['New York City', 'Buffalo', 'Albany', 'Rochester'] },
      { name: 'North Carolina', code: 'NC', cities: ['Charlotte', 'Raleigh', 'Greensboro'] },
      { name: 'North Dakota', code: 'ND', cities: ['Bismarck', 'Fargo', 'Grand Forks'] },
      { name: 'Ohio', code: 'OH', cities: ['Columbus', 'Cleveland', 'Cincinnati'] },
      { name: 'Oklahoma', code: 'OK', cities: ['Oklahoma City', 'Tulsa', 'Norman'] },
      { name: 'Oregon', code: 'OR', cities: ['Portland', 'Eugene', 'Salem'] },
      { name: 'Pennsylvania', code: 'PA', cities: ['Philadelphia', 'Pittsburgh', 'Allentown'] },
      { name: 'Rhode Island', code: 'RI', cities: ['Providence', 'Warwick', 'Cranston'] },
      { name: 'South Carolina', code: 'SC', cities: ['Charleston', 'Columbia', 'Greenville'] },
      { name: 'South Dakota', code: 'SD', cities: ['Sioux Falls', 'Rapid City', 'Aberdeen'] },
      { name: 'Tennessee', code: 'TN', cities: ['Nashville', 'Memphis', 'Knoxville'] },
      { name: 'Texas', code: 'TX', cities: ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'] },
      { name: 'Utah', code: 'UT', cities: ['Salt Lake City', 'Provo', 'Ogden'] },
      { name: 'Vermont', code: 'VT', cities: ['Burlington', 'Rutland', 'Montpelier'] },
      { name: 'Virginia', code: 'VA', cities: ['Virginia Beach', 'Richmond', 'Arlington'] },
      { name: 'Washington', code: 'WA', cities: ['Seattle', 'Spokane', 'Tacoma'] },
      { name: 'West Virginia', code: 'WV', cities: ['Charleston', 'Huntington', 'Parkersburg'] },
      { name: 'Wisconsin', code: 'WI', cities: ['Milwaukee', 'Madison', 'Green Bay'] },
      { name: 'Wyoming', code: 'WY', cities: ['Cheyenne', 'Casper', 'Laramie'] },
    ]
  },
  {
    name: 'Canada',
    code: 'CA',
    hasStates: true,
    states: [
      {
        name: 'Ontario',
        code: 'ON',
        cities: ['Toronto', 'Ottawa', 'Hamilton', 'London']
      },
      {
        name: 'British Columbia',
        code: 'BC',
        cities: ['Vancouver', 'Victoria', 'Surrey', 'Whistler']
      },
      {
        name: 'Quebec',
        code: 'QC',
        cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau']
      },
      {
        name: 'Alberta',
        code: 'AB',
        cities: ['Calgary', 'Edmonton', 'Banff', 'Lake Louise']
      }
    ]
  },
  {
    name: 'Mexico',
    code: 'MX',
    hasStates: false,
    cities: ['Mexico City', 'Cancun', 'Playa del Carmen', 'Puerto Vallarta', 'Cabo San Lucas', 'Los Cabos', 'Cozumel']
  },

  // Europe
  {
    name: 'France',
    code: 'FR',
    hasStates: false,
    cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Cannes', 'Provence', 'Bordeaux', 'Strasbourg', 'Annecy']
  },
  {
    name: 'United Kingdom',
    code: 'GB',
    hasStates: false,
    cities: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Bath', 'Oxford', 'Cambridge', 'Liverpool', 'York']
  },
  {
    name: 'Germany',
    code: 'DE',
    hasStates: false,
    cities: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne', 'Dresden', 'Düsseldorf', 'Stuttgart', 'Heidelberg', 'Bavarian Alps']
  },
  {
    name: 'Italy',
    code: 'IT',
    hasStates: false,
    cities: ['Rome', 'Milan', 'Venice', 'Florence', 'Naples', 'Positano', 'Amalfi', 'Cinque Terre', 'Bologna', 'Siena']
  },
  {
    name: 'Spain',
    code: 'ES',
    hasStates: false,
    cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Granada', 'Toledo', 'Mallorca', 'Ibiza', 'San Sebastian', 'Bilbao']
  },
  {
    name: 'Netherlands',
    code: 'NL',
    hasStates: false,
    cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Delft', 'Haarlem', 'Leiden']
  },
  {
    name: 'Belgium',
    code: 'BE',
    hasStates: false,
    cities: ['Brussels', 'Antwerp', 'Bruges', 'Ghent', 'Liège']
  },
  {
    name: 'Switzerland',
    code: 'CH',
    hasStates: false,
    cities: ['Zurich', 'Geneva', 'Bern', 'Lucerne', 'Interlaken', 'Zermatt', 'Grindelwald']
  },
  {
    name: 'Austria',
    code: 'AT',
    hasStates: false,
    cities: ['Vienna', 'Salzburg', 'Innsbruck', 'Hallstatt', 'Graz', 'Linz']
  },
  {
    name: 'Czech Republic',
    code: 'CZ',
    hasStates: false,
    cities: ['Prague', 'Brno', 'Cesky Krumlov', 'Karlovy Vary', 'Olomouc']
  },
  {
    name: 'Poland',
    code: 'PL',
    hasStates: false,
    cities: ['Warsaw', 'Krakow', 'Gdansk', 'Wroclaw', 'Poznan', 'Auschwitz']
  },
  {
    name: 'Hungary',
    code: 'HU',
    hasStates: false,
    cities: ['Budapest', 'Debrecen', 'Szeged', 'Lake Balaton']
  },
  {
    name: 'Greece',
    code: 'GR',
    hasStates: false,
    cities: ['Athens', 'Santorini', 'Mykonos', 'Rhodes', 'Crete', 'Meteora', 'Delphi']
  },
  {
    name: 'Portugal',
    code: 'PT',
    hasStates: false,
    cities: ['Lisbon', 'Porto', 'Madeira', 'Faro', 'Sintra', 'Cascais', 'Lagos']
  },
  {
    name: 'Turkey',
    code: 'TR',
    hasStates: false,
    cities: ['Istanbul', 'Ankara', 'Izmir', 'Cappadocia', 'Antalya', 'Bodrum', 'Ephesus']
  },
  {
    name: 'Ireland',
    code: 'IE',
    hasStates: false,
    cities: ['Dublin', 'Cork', 'Galway', 'Limerick', 'Waterford', 'Cliffs of Moher']
  },
  {
    name: 'Sweden',
    code: 'SE',
    hasStates: false,
    cities: ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Swedish Lapland']
  },
  {
    name: 'Norway',
    code: 'NO',
    hasStates: false,
    cities: ['Oslo', 'Bergen', 'Stavanger', 'Trondheim', 'Tromsø', 'Norwegian Fjords']
  },
  {
    name: 'Denmark',
    code: 'DK',
    hasStates: false,
    cities: ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg']
  },

  // Asia
  {
    name: 'Japan',
    code: 'JP',
    hasStates: false,
    cities: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Hiroshima', 'Nagoya', 'Yokosuka', 'Mount Fuji']
  },
  {
    name: 'Thailand',
    code: 'TH',
    hasStates: false,
    cities: ['Bangkok', 'Chiang Mai', 'Phuket', 'Krabi', 'Pattaya', 'Koh Samui', 'Ayutthaya']
  },
  {
    name: 'Vietnam',
    code: 'VN',
    hasStates: false,
    cities: ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Hoi An', 'Ha Long Bay', 'Sapa']
  },
  {
    name: 'Cambodia',
    code: 'KH',
    hasStates: false,
    cities: ['Phnom Penh', 'Siem Reap', 'Angkor Wat', 'Sihanoukville', 'Battambang']
  },
  {
    name: 'Indonesia',
    code: 'ID',
    hasStates: false,
    cities: ['Jakarta', 'Bali', 'Yogyakarta', 'Lombok', 'Flores', 'Komodo', 'Sulawesi']
  },
  {
    name: 'Malaysia',
    code: 'MY',
    hasStates: false,
    cities: ['Kuala Lumpur', 'George Town', 'Penang', 'Langkawi', 'Kuching', 'Kota Kinabalu']
  },
  {
    name: 'Singapore',
    code: 'SG',
    hasStates: false,
    cities: ['Singapore']
  },
  {
    name: 'Philippines',
    code: 'PH',
    hasStates: false,
    cities: ['Manila', 'Cebu', 'Boracay', 'Palawan', 'Davao', 'Iloilo']
  },
  {
    name: 'South Korea',
    code: 'SK',
    hasStates: false,
    cities: ['Seoul', 'Busan', 'Daegu', 'Incheon', 'Jeju Island', 'Gyeongju']
  },
  {
    name: 'India',
    code: 'IN',
    hasStates: false,
    cities: ['New Delhi', 'Mumbai', 'Bangalore', 'Jaipur', 'Agra', 'Taj Mahal', 'Goa', 'Kerala']
  },
  {
    name: 'China',
    code: 'CN',
    hasStates: false,
    cities: ['Beijing', 'Shanghai', 'Xi\'an', 'Chengdu', 'Hangzhou', 'Guilin', 'Great Wall']
  },
  {
    name: 'Hong Kong',
    code: 'HK',
    hasStates: false,
    cities: ['Hong Kong']
  },
  {
    name: 'Taiwan',
    code: 'TW',
    hasStates: false,
    cities: ['Taipei', 'Taichung', 'Tainan', 'Jiufen']
  },
  {
    name: 'Pakistan',
    code: 'PK',
    hasStates: false,
    cities: ['Islamabad', 'Karachi', 'Lahore', 'Peshawar', 'Hunza Valley']
  },
  {
    name: 'Nepal',
    code: 'NP',
    hasStates: false,
    cities: ['Kathmandu', 'Pokhara', 'Namche Bazaar', 'Everest Base Camp', 'Chitwan']
  },
  {
    name: 'Sri Lanka',
    code: 'LK',
    hasStates: false,
    cities: ['Colombo', 'Kandy', 'Galle', 'Mirissa', 'Nuwara Eliya', 'Sigiriya']
  },
  {
    name: 'Myanmar',
    code: 'MM',
    hasStates: false,
    cities: ['Yangon', 'Mandalay', 'Bagan', 'Inle Lake', 'Taunggyi']
  },

  // Middle East
  {
    name: 'United Arab Emirates',
    code: 'AE',
    hasStates: false,
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah']
  },
  {
    name: 'Saudi Arabia',
    code: 'SA',
    hasStates: false,
    cities: ['Riyadh', 'Jeddah', 'Dammam', 'Mecca']
  },
  {
    name: 'Qatar',
    code: 'QA',
    hasStates: false,
    cities: ['Doha']
  },
  {
    name: 'Israel',
    code: 'IL',
    hasStates: false,
    cities: ['Tel Aviv', 'Jerusalem', 'Haifa', 'Eilat', 'Dead Sea']
  },

  // Africa
  {
    name: 'Egypt',
    code: 'EG',
    hasStates: false,
    cities: ['Cairo', 'Giza', 'Luxor', 'Aswan', 'Alexandria', 'Pyramids']
  },
  {
    name: 'South Africa',
    code: 'ZA',
    hasStates: false,
    cities: ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Safari Parks']
  },
  {
    name: 'Kenya',
    code: 'KE',
    hasStates: false,
    cities: ['Nairobi', 'Mombasa', 'Amboseli', 'Masai Mara', 'Mount Kenya']
  },
  {
    name: 'Tanzania',
    code: 'TZ',
    hasStates: false,
    cities: ['Dar es Salaam', 'Zanzibar', 'Kilimanjaro', 'Serengeti', 'Arusha']
  },
  {
    name: 'Morocco',
    code: 'MA',
    hasStates: false,
    cities: ['Marrakech', 'Fez', 'Casablanca', 'Tangier', 'Sahara Desert', 'Atlas Mountains']
  },
  {
    name: 'Tunisia',
    code: 'TN',
    hasStates: false,
    cities: ['Tunis', 'Sousse', 'Monastir', 'Djerba', 'Sahara']
  },
  {
    name: 'Nigeria',
    code: 'NG',
    hasStates: false,
    cities: ['Lagos', 'Abuja', 'Kano', 'Port Harcourt']
  },

  // Americas
  {
    name: 'Argentina',
    code: 'AR',
    hasStates: false,
    cities: ['Buenos Aires', 'Mendoza', 'Bariloche', 'Salta', 'Córdoba']
  },
  {
    name: 'Brazil',
    code: 'BR',
    hasStates: false,
    cities: ['Rio de Janeiro', 'São Paulo', 'Salvador', 'Brasília', 'Manaus', 'Amazon']
  },
  {
    name: 'Chile',
    code: 'CL',
    hasStates: false,
    cities: ['Santiago', 'Valparaíso', 'Atacama Desert', 'Easter Island', 'Patagonia']
  },
  {
    name: 'Peru',
    code: 'PE',
    hasStates: false,
    cities: ['Lima', 'Cusco', 'Machu Picchu', 'Sacred Valley', 'Lake Titicaca']
  },
  {
    name: 'Colombia',
    code: 'CO',
    hasStates: false,
    cities: ['Bogotá', 'Medellín', 'Cartagena', 'Santa Marta', 'Salento']
  },
  {
    name: 'Ecuador',
    code: 'EC',
    hasStates: false,
    cities: ['Quito', 'Guayaquil', 'Galápagos Islands', 'Amazon', 'Otavalo']
  },
  {
    name: 'Bolivia',
    code: 'BO',
    hasStates: false,
    cities: ['La Paz', 'Santa Cruz', 'Sucre', 'Salar de Uyuni', 'Lake Titicaca']
  },
  {
    name: 'Costa Rica',
    code: 'CR',
    hasStates: false,
    cities: ['San José', 'San José', 'Manuel Antonio', 'Arenal', 'Monteverde', 'Tortuguero']
  },
  {
    name: 'Panama',
    code: 'PA',
    hasStates: false,
    cities: ['Panama City', 'Bocas del Toro', 'Boquete', 'San Blas Islands']
  },
  {
    name: 'Belize',
    code: 'BZ',
    hasStates: false,
    cities: ['Belize City', 'Ambergris Caye', 'San Ignacio', 'Hopkins']
  },
  {
    name: 'Guatemala',
    code: 'GT',
    hasStates: false,
    cities: ['Guatemala City', 'Antigua', 'Lake Atitlán', 'Chichicastenango', 'Tikal']
  },

  // Oceania
  {
    name: 'Australia',
    code: 'AU',
    hasStates: false,
    cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Cairns', 'Great Barrier Reef', 'Uluru']
  },
  {
    name: 'New Zealand',
    code: 'NZ',
    hasStates: false,
    cities: ['Auckland', 'Wellington', 'Christchurch', 'Queenstown', 'Rotorua', 'Milford Sound']
  },
  {
    name: 'Fiji',
    code: 'FJ',
    hasStates: false,
    cities: ['Nadi', 'Suva', 'Coral Coast', 'Denarau Island']
  },
];