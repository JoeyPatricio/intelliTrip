import dotenv from 'dotenv';
dotenv.config();

async function debugAthensFinal() {
  console.log('Final Athens debugging with updated Greek names...');
  
  try {
    // Test with the exact updated mapping
    const cityInfoMap: Record<string, { country: string; altNames: string[] }> = {
      'athens': { country: 'greece', altNames: ['athens', 'athina', 'αθήνα', 'athina'] }
    };

    const city = 'Athens';
    const cityLower = city.toLowerCase();
    const cityInfo = cityInfoMap[cityLower] || { country: '', altNames: [cityLower] };
    
    console.log(`City: ${city}`);
    console.log(`Alt names: ${cityInfo.altNames.join(', ')}`);
    
    // Test one category - museums
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
    console.log(`\nTotal results for "${query}": ${data.length}`);
    
    // Apply exact same filtering logic as updated backend
    const countryVariations: Record<string, string[]> = {
      'greece': ['greece', 'ελλάδα', 'hellas']
    };
    
    const expectedCountryVariations = countryVariations[cityInfo.country.toLowerCase()] || [cityInfo.country.toLowerCase()];
    
    console.log(`Expected country: ${cityInfo.country}`);
    console.log(`Country variations: ${expectedCountryVariations.join(', ')}`);
    
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
      console.log(`  Address city: "${addressCity}"`);
      console.log(`  Address country: "${addressCountry}"`);
      console.log(`  City match: ${cityMatch} (looking for: ${cityInfo.altNames.join(' or ')})`);
      console.log(`  Country match: ${countryMatch} (looking for: ${expectedCountryVariations.join(' or ')})`);
      console.log(`  Overall: ${cityMatch && countryMatch}`);
      
      return cityMatch && countryMatch;
    });

    console.log(`\nFiltered results: ${filteredResults.length}`);
    
    if (filteredResults.length > 0) {
      console.log('\n✅ SUCCESS: Athens filtering working!');
      filteredResults.slice(0, 3).forEach((place: any, index: number) => {
        console.log(`${index + 1}. ${place.display_name}`);
      });
    } else {
      console.log('\n❌ FAILED: No Athens results found');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', (error as Error).message);
  }
}

debugAthensFinal();
