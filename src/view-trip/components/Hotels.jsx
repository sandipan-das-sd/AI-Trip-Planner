// import React from 'react'
// import { Link } from 'react-router-dom'
// import HotelCardItem from './HotelCardItem'

// function Hotels({ trip }) {
//     return (
//         <div>
//             <h2 className='font-bold text-xl mt-5'>Hotel Recommendation</h2>
//             <div className='grid grid-cols-2 md:grid-cols-3 xl-grid-cols-4 gap-5'>
//                 {trip?.tripData?.hotel_options?.map((hotel, index) => (
//                     <HotelCardItem hotel={hotel} />
//                 ))}
//             </div>
//         </div>
//     )
// }

// export default Hotels

// import React from 'react'
// import { Link } from 'react-router-dom'
// import HotelCardItem from './HotelCardItem'

// function Hotels({ trip }) {
//     return (
//         <div>
//             <h2 className='font-bold text-xl mt-5'>Hotel Recommendation</h2>
//             <div className='grid grid-cols-2 md:grid-cols-3 xl-grid-cols-4 gap-5'>
//                 {trip?.tripData?.hotel_options?.map((hotel, index) => (
//                     <HotelCardItem key={`hotel-${index}`} hotel={hotel} />
//                 ))}
//             </div>
//         </div>
//     )
// }

// export default Hotels

import React from 'react'
import HotelCardItem from './HotelCardItem'
import { FaBed, FaRegBuilding } from 'react-icons/fa'

function Hotels({ trip }) {
  return (
    <div className="my-10">
      <div className="flex items-center mb-6">
        <FaBed className="text-orange-500 mr-3 text-xl" />
        <h2 className='font-bold text-2xl text-gray-800'>Hotel Recommendations</h2>
      </div>
      
      {!trip?.tripData?.hotel_options || trip.tripData.hotel_options.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
          <FaRegBuilding className="text-gray-400 text-4xl mx-auto mb-3" />
          <p className="text-gray-500 text-lg">No hotel recommendations available for this trip.</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {trip.tripData.hotel_options.map((hotel, index) => (
            <HotelCardItem key={`hotel-${index}`} hotel={hotel} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Hotels