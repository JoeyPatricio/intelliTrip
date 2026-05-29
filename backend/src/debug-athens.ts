import dotenv from 'dotenv';
dotenv.config();

async function debugAthensFiltering() {
  console.log('Debugging Athens filtering...');
  
  try {
    // Test exact same logic as backend for Athens
    const cityInfoMap: Record<string, { country: string; altNames: string[] }> = {
      'athens': { country: 'greece', altNames: ['athens', 'athina'] }
    };

    const city = 'Athens';
    const cityLower = city.toLowerCase();
    const cityInfo = cityInfoMap[cityLower] || { country: '', altNames: [cityLower] };
    
    console.log(`City: ${city}`);
    console.log(`City lower: ${cityLower}`);
    console.log(`City info:`, cityInfo);
    
    const query = `${city} museum`;
    const encodedQuery = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=10&addressdetails=1`;
    
    console.log(`\nQuery: ${query}`);
    console.log(`URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'intelliTrip/1.0 (https://github.com/your-repo/intelliTrip)',
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log(`\nTotal results: ${data.length}`);
    
    // Apply exact same filtering logic as backend
    const countryVariations: Record<string, string[]> = {
      'greece': ['greece', 'ελλάδα', 'hellas']
    };
    
    const expectedCountryVariations = countryVariations[cityInfo.country.toLowerCase()] || [cityInfo.country.toLowerCase()];
    
    console.log(`\nExpected country: ${cityInfo.country}`);
    console.log(`Country variations: ${expectedCountryVariations.join(', ')}`);
    console.log(`Alt names: ${cityInfo.altNames.join(', ')}`);
    
    const filteredResults = data.filter((place: any) => {
      if (!place.display_name || place.type === 'administrative') return false;

      const displayName = place.display_name.toLowerCase();
      const addressCity = place.address?.city?.toLowerCase() || place.address?.town?.toLowerCase() || place.address?.village?.toLowerCase() || '';
      const addressCountry = place.address?.country?.toLowerCase() || '';

      // Filter for places that contain any of the alternative city names AND match expected country
      const cityMatch = cityInfo.altNames.some(altName => 
        displayName.includes(altName) || addressCity.includes(altName)
      );
      
      const countryMatch = expectedCountryVariations.some(variation => 
        addressCountry.includes(variation)
      );

      console.log(`\nPlace: ${place.display_name}`);
      console.log(`  City: ${addressCity}`);
      console.log(`  Country: ${addressCountry}`);
      console.log(`  City match: ${cityMatch}`);
      console.log(`  Country match: ${countryMatch}`);
      console.log(`  Overall match: ${cityMatch && countryMatch}`);
      
      return cityMatch && countryMatch;
    });

    console.log(`\nFiltered results: ${filteredResults.length}`);
    
    filteredResults.slice(0, 3).forEach((place: any, index: number) => {
      console.log(`${index + 1}. ${place.display_name}`);
      console.log(`   Country: ${place.address?.country || 'Unknown'}`);
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', (error as Error).message);
  }
}

debugAthensFiltering();
