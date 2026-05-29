const testAthensRequest = {
  "origin": {
    "city": "New York",
    "state": "NY",
    "country": "USA"
  },
  "destinations": [
    {
      "city": "Athens",
      "country": "Greece"
    }
  ],
  "tripLength": 3,
  "interests": ["history", "museums", "food"],
  "budget": "moderate",
  "travelStyle": "packed"
};

async function testAthensItinerary() {
  console.log('Testing Athens itinerary generation with improved OpenStreetMap...');
  
  try {
    const response = await fetch('http://localhost:4000/api/itinerary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testAthensRequest)
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    
    console.log('✅ Athens itinerary generation successful!');
    console.log('\n--- Athens Itinerary ---');
    
    if (result.itinerary && result.itinerary.length > 0) {
      result.itinerary.forEach((day, index) => {
        console.log(`\nDay ${day.day}: ${day.summary}`);
        console.log(`Activities: ${day.activities.length} (expected: 4 for packed style)`);
        day.activities.forEach((activity, actIndex) => {
          console.log(`  ${actIndex + 1}. ${activity.time} - ${activity.title}`);
          console.log(`     Location: ${activity.location}`);
          console.log(`     Price: $${activity.estimatedPrice}`);
        });
      });
      
      console.log(`\n--- Pricing ---`);
      console.log(`Flight: $${result.flightPrice}`);
      console.log(`Hotel per night: $${result.hotelPerNight}`);
      console.log(`Total hotel: $${result.totalHotel}`);
      console.log(`Total trip: $${result.totalPrice}`);
      
      console.log('\n✅ Athens itinerary completed!');
    } else {
      console.log('❌ No itinerary generated');
    }
    
  } catch (error) {
    console.error('❌ Athens itinerary test failed:', error.message);
  }
}

testAthensItinerary();
