const fetch = require('node-fetch');

async function testOpenStreetMap() {
  console.log('Testing OpenStreetMap Nominatim API...');
  
  try {
    const testQueries = [
      'top tourist attractions in Paris',
      'best museums in London',
      'best restaurants in Tokyo'
    ];

    for (const query of testQueries) {
      console.log(`\nTesting query: "${query}"`);
      const encodedQuery = encodeURIComponent(query);
      const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=6&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'intelliTrip/1.0 (https://github.com/your-repo/intelliTrip)',
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log(`Found ${data.length} results:`);
      
      data.slice(0, 3).forEach((place, index) => {
        console.log(`${index + 1}. ${place.display_name} (${place.type})`);
      });
    }
    
    console.log('\n✅ OpenStreetMap integration test successful!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOpenStreetMap();
