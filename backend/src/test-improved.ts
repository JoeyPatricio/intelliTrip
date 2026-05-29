import dotenv from 'dotenv';
dotenv.config();

async function testImprovedFiltering() {
  console.log('Testing improved OpenStreetMap location filtering...');
  
  try {
    // Test the exact same logic as the backend
    const cityCountryMap: Record<string, string> = {
      'paris': 'france',
      'rome': 'italy',
      'london': 'united kingdom',
      'tokyo': 'japan',
      'new york': 'united states',
      'barcelona': 'spain',
      'amsterdam': 'netherlands',
      'berlin': 'germany',
      'madrid': 'spain',
      'prague': 'czech republic'
    };

    const testCities = ['Paris', 'Rome'];
    
    for (const city of testCities) {
      console.log(`\n=== Testing ${city} ===`);
      const cityLower = city.toLowerCase();
      const expectedCountry = cityCountryMap[cityLower] || '';
      console.log(`Expected country: ${expectedCountry}`);
      
      const query = `${city} museum`;
      const encodedQuery = encodeURIComponent(query);
      const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=10&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'intelliTrip/1.0 (https://github.com/your-repo/intelliTrip)',
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Apply the same filtering logic as backend
      const filteredResults = data.filter((place: any) => {
        if (!place.display_name || place.type === 'administrative') return false;
        
        const displayName = place.display_name.toLowerCase();
        const addressCity = place.address?.city?.toLowerCase() || place.address?.town?.toLowerCase() || place.address?.village?.toLowerCase() || '';
        const addressCountry = place.address?.country?.toLowerCase() || '';
        
        // Filter for places that contain city name AND match expected country
        const cityMatch = displayName.includes(cityLower) || addressCity.includes(cityLower);
        const countryMatch = !expectedCountry || addressCountry.includes(expectedCountry);
        
        return cityMatch && countryMatch;
      });

      console.log(`Original results: ${data.length}, Filtered results: ${filteredResults.length}`);
      
      filteredResults.slice(0, 3).forEach((place: any, index: number) => {
        console.log(`${index + 1}. ${place.display_name}`);
        console.log(`   Country: ${place.address?.country || 'Unknown'}`);
      });
    }
    
    console.log('\n✅ Improved filtering test completed!');
  } catch (error) {
    console.error('❌ Test failed:', (error as Error).message);
  }
}

testImprovedFiltering();
