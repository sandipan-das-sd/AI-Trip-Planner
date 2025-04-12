// import React, { useEffect, useState } from 'react'
// import { Button } from '@/components/ui/button'
// import { FaMapLocationDot } from "react-icons/fa6";
// import { Link } from 'react-router-dom';
// import { GetPlaceDetails, PHOTO_REF_URL } from '@/service/GlobalApi';

// function PlaceCardItem({place}) {
//   const [photoUrl, setPhotoUrl] = useState();

//   useEffect(() => {
//       place && GetPlacePhoto();
//   }, [place])

//   const GetPlacePhoto = async () => {
//       const data = {
//           textQuery: place?.place
//       }
//       const result = await GetPlaceDetails(data).then(resp => {
//           console.log(resp.data.places[0].photos[3].name)
//           const PhotoUrl = PHOTO_REF_URL.replace('{NAME}', resp.data.places[0].photos[3].name)
//           setPhotoUrl(PhotoUrl)
//       })
//   }

//   return (
//     <Link to={'https://www.google.com/maps/search/?api=1&query=' +place?.place} target='_blank'>
//     <div className='shadow-sm border rounded-xl p-3 mt-2 flex gap-5 hover:scale-105 hover:shadow-md cursor-pointer transition-all'>
//         <img src={photoUrl?photoUrl:'/placeholder.jpg'} alt="" className='w-[130px] h-[130px] rounded-xl object-cover' />
//         <div>
//             <h2 className='font-bold text-lg'>{place.place}</h2>
//             <p className='text-sm text-gray-500'>{place.details}</p>
//             {/* <h2>place.timetoTravel</h2> */}
//             <h2 className='text-xs font-medium mt-2 mb-2'>🏷️Ticket: {place.ticket_pricing}</h2>
//             {/* <Button size="sm"><FaMapLocationDot /></Button> */}
//         </div>
//     </div>
//     </Link>
//   )
// }

// export default PlaceCardItem

// import React, { useEffect, useState } from 'react'
// import { Link } from 'react-router-dom'
// import { GetPlaceDetails, PHOTO_REF_URL } from '@/service/GlobalApi'

// function PlaceCardItem({place}) {
//   const [photoUrl, setPhotoUrl] = useState()
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     if (place && place.place) {
//       GetPlacePhoto()
//     } else {
//       setIsLoading(false)
//     }
//   }, [place])

//   const GetPlacePhoto = async () => {
//     try {
//       setIsLoading(true)
      
//       const data = {
//         textQuery: place?.place
//       }
      
//       const result = await GetPlaceDetails(data)
      
//       if (result.data.places && 
//           result.data.places.length > 0 && 
//           result.data.places[0].photos && 
//           result.data.places[0].photos.length > 0) {
        
//         // Safely access a photo - use index 0 if index 3 isn't available
//         const photoIndex = result.data.places[0].photos.length > 3 ? 3 : 0
//         const photoName = result.data.places[0].photos[photoIndex].name
//         const photoUrl = PHOTO_REF_URL.replace('{NAME}', photoName)
//         setPhotoUrl(photoUrl)
//       } else {
//         // Use the image URL from the place data if available
//         setPhotoUrl(place.image_url || '/placeholder.jpg')
//       }
//     } catch (error) {
//       console.error("Error fetching place photo:", error)
//       setPhotoUrl(place.image_url || '/placeholder.jpg')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <Link to={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(place?.place || '')} target='_blank'>
//       <div className='shadow-sm border rounded-xl p-3 mt-2 flex gap-5 hover:scale-105 hover:shadow-md cursor-pointer transition-all'>
//         {isLoading ? (
//           <div className='w-[130px] h-[130px] rounded-xl bg-gray-200 animate-pulse'></div>
//         ) : (
//           <img 
//             src={photoUrl || '/placeholder.jpg'} 
//             alt={place?.place || "Place image"} 
//             className='w-[130px] h-[130px] rounded-xl object-cover'
//             onError={() => setPhotoUrl('/placeholder.jpg')}
//           />
//         )}
//         <div>
//           <h2 className='font-bold text-lg'>{place?.place}</h2>
//           <p className='text-sm text-gray-500'>{place?.details}</p>
//           <h2 className='text-xs font-medium mt-2 mb-2'>🏷️Ticket: {place?.ticket_pricing || "Free"}</h2>
//         </div>
//       </div>
//     </Link>
//   )
// }

// export default PlaceCardItem

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GetPlaceDetails, PHOTO_REF_URL } from '@/service/GlobalApi'

function PlaceCardItem({place}) {
  const [photoUrl, setPhotoUrl] = useState()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (place && place.place) {
      fetchPlacePhoto()
    } else {
      setIsLoading(false)
    }
  }, [place])

  const fetchPlacePhoto = async () => {
    try {
      setIsLoading(true)
      
      // Try with a specific search using location context if available
      const locationContext = place.geo_coordinates ? ` near ${place.geo_coordinates}` : ''
      
      const data = {
        textQuery: `${place.place}${locationContext}`
      }
      
      const result = await GetPlaceDetails(data)
      
      if (result.data.places && 
          result.data.places.length > 0 && 
          result.data.places[0].photos && 
          result.data.places[0].photos.length > 0) {
        
        // We have photos, use the best one (index 0 is usually best)
        const photoIndex = 0
        const photoName = result.data.places[0].photos[photoIndex].name
        const photoUrl = PHOTO_REF_URL.replace('{NAME}', photoName)
        setPhotoUrl(photoUrl)
      } else {
        // First search failed, try a more general search
        const backupData = {
          textQuery: `${place.place} landmark attraction`
        }
        
        try {
          const backupResult = await GetPlaceDetails(backupData)
          
          if (backupResult.data.places && 
              backupResult.data.places.length > 0 && 
              backupResult.data.places[0].photos && 
              backupResult.data.places[0].photos.length > 0) {
            
            const photoName = backupResult.data.places[0].photos[0].name
            const photoUrl = PHOTO_REF_URL.replace('{NAME}', photoName)
            setPhotoUrl(photoUrl)
          } else {
            // If even the backup search fails, try a third approach with just the name
            const lastAttemptData = {
              textQuery: place.place
            }
            
            const lastResult = await GetPlaceDetails(lastAttemptData)
            
            if (lastResult.data.places && 
                lastResult.data.places.length > 0 && 
                lastResult.data.places[0].photos && 
                lastResult.data.places[0].photos.length > 0) {
              
              const photoName = lastResult.data.places[0].photos[0].name
              const photoUrl = PHOTO_REF_URL.replace('{NAME}', photoName)
              setPhotoUrl(photoUrl)
            } else {
              // Only use image_url as last resort if all Google searches fail
              setPhotoUrl(place.image_url || '/placeholder.jpg')
            }
          }
        } catch (backupError) {
          console.error("Error in backup photo search:", backupError)
          setPhotoUrl(place.image_url || '/placeholder.jpg')
        }
      }
    } catch (error) {
      console.error("Error fetching place photo:", error)
      // Only use image_url if all attempts fail
      setPhotoUrl(place.image_url || '/placeholder.jpg')
    } finally {
      setIsLoading(false)
    }
  }

  // Use coordinates in map link if available for better accuracy
  const mapQuery = place?.geo_coordinates 
    ? encodeURIComponent(place.geo_coordinates)
    : encodeURIComponent(place?.place || '')

  return (
    <Link to={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target='_blank'>
      <div className='shadow-sm border rounded-xl p-3 mt-2 flex gap-5 hover:scale-105 hover:shadow-md cursor-pointer transition-all'>
        {isLoading ? (
          <div className='w-[130px] h-[130px] rounded-xl bg-gray-200 animate-pulse'></div>
        ) : (
          <img 
            src={photoUrl} 
            alt={place?.place || "Place image"} 
            className='w-[130px] h-[130px] rounded-xl object-cover'
            onError={(e) => {
              // If the image fails, try Unsplash as a final backup
              if (e.target.src !== '/placeholder.jpg') {
                console.log("Trying Unsplash for place image:", place?.place)
                const query = encodeURIComponent(place?.place || "travel destination")
                setPhotoUrl(`https://source.unsplash.com/featured/?${query}`)
              } else {
                setPhotoUrl('/placeholder.jpg')
              }
            }}
          />
        )}
        <div>
          <h2 className='font-bold text-lg'>{place?.place}</h2>
          <p className='text-sm text-gray-500'>{place?.details}</p>
          <h2 className='text-xs font-medium mt-2 mb-2'>🏷️Ticket: {place?.ticket_pricing || "Free"}</h2>
        </div>
      </div>
    </Link>
  )
}

export default PlaceCardItem