// import React from 'react'
// import PlaceCardItem from './PlaceCardItem'

// function PlacesToVisit({trip}) {
//   return (
//     <div>
//         <h2 className='font-bold text-xl'>Places to Visit</h2>
//         <div>
//             {trip.tripData?.itinerary.map((item,index)=>(
//                 <>
//                 <div className='mt-5'>
//                     <h2 className='font-bold text-lg'>{item.day}</h2>
//                     <div className='grid md:grid-cols-2 gap-5'>
//                     {item.plan.map((place, index)=> (
//                         <>
//                         <div className='my-2'>
//                             <h2 className='font-medium text-sm text-orange-600'>{place.time}</h2>
//                             <PlaceCardItem place={place}/>
//                         </div>
//                         </>
//                     ))}
//                     </div>
//                     </div>
//                 </>
//             ))}
//         </div>
//     </div>
//   )
// }

// export default PlacesToVisit

import React from 'react'
import PlaceCardItem from './PlaceCardItem'

function PlacesToVisit({trip}) {
  // Check if itinerary exists 
  const hasItinerary = trip?.tripData?.itinerary && typeof trip.tripData.itinerary === 'object';
  
  // Process the itinerary data if it exists
  const formattedItinerary = [];
  
  if (hasItinerary) {
    // Get all days and sort them numerically (day1, day2, etc.)
    const days = Object.keys(trip.tripData.itinerary);
    const sortedDays = days.sort((a, b) => {
      const dayNumA = parseInt(a.replace('day', ''));
      const dayNumB = parseInt(b.replace('day', ''));
      return dayNumA - dayNumB;
    });
    
    // Format each day's data
    sortedDays.forEach(dayKey => {
      const dayData = trip.tripData.itinerary[dayKey];
      formattedItinerary.push({
        day: `Day ${dayKey.replace('day', '')}`,
        plan: dayData.plan || []
      });
    });
  }
  
  return (
    <div>
      <h2 className='font-bold text-xl'>Places to Visit</h2>
      
      {!hasItinerary || formattedItinerary.length === 0 ? (
        <div className='mt-5 p-6 bg-gray-50 rounded-lg text-center'>
          <p className='text-gray-500'>No itinerary available for this trip yet.</p>
        </div>
      ) : (
        <div>
          {formattedItinerary.map((item, index) => (
            <div key={index} className='mt-5'>
              <h2 className='font-bold text-lg'>{item.day}</h2>
              <div className='grid md:grid-cols-2 gap-5'>
                {Array.isArray(item.plan) && item.plan.length > 0 ? (
                  item.plan.map((place, placeIndex) => (
                    <div key={placeIndex} className='my-2'>
                      <h2 className='font-medium text-sm text-orange-600'>{place.time}</h2>
                      <PlaceCardItem place={place}/>
                    </div>
                  ))
                ) : (
                  <div className='my-2 col-span-2'>
                    <p className='text-gray-500'>No places to visit available for this day.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PlacesToVisit