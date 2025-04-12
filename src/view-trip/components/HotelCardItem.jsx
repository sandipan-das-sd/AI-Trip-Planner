// import { GetPlaceDetails, PHOTO_REF_URL } from '@/service/GlobalApi';
// import React, { useEffect, useState } from 'react'
// import { Link } from 'react-router-dom'

// function HotelCardItem({ hotel }) {
//     const [photoUrl, setPhotoUrl] = useState();

//     useEffect(() => {
//         hotel&&GetPlacePhoto();
//     }, [hotel])

//     const GetPlacePhoto = async () => {
//         const data = {
//             textQuery: hotel?.name
//         }
//         const result = await GetPlaceDetails(data).then(resp => {
//             console.log(resp.data.places[0].photos[3].name)
//             const PhotoUrl = PHOTO_REF_URL.replace('{NAME}', resp.data.places[0].photos[3].name)
//             setPhotoUrl(PhotoUrl)
//         })
//     }

//     return (
//         <Link to={'https://www.google.com/maps/search/?api=1&query=' + hotel?.name + "," + hotel?.address} target='_blank'>

//             <div className='hover:scale-110 transition-all cursor-pointer mt-5 mb-8'>
//                 <img src={photoUrl?photoUrl:'/placeholder.jpg'} className='rounded-xl h-[180px] w-full object-cover' />
//                 <div className='my-2'>
//                     <h2 className='font-medium'>{hotel?.name}</h2>
//                     <h2 className='text-xs text-gray-500'>📍{hotel?.address}</h2>
//                     <h2 className='text-sm'>💰{hotel?.price}</h2>
//                     <h2 className='text-sm'>⭐{hotel?.rating}</h2>

//                 </div>
//             </div></Link>
//     )
// }

// export default HotelCardItem

import { GetPlaceDetails, PHOTO_REF_URL } from '@/service/GlobalApi'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function HotelCardItem({ hotel }) {
  const [photoUrl, setPhotoUrl] = useState()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (hotel && hotel.name) {
      GetPlacePhoto()
    } else {
      setIsLoading(false)
    }
  }, [hotel])

  const GetPlacePhoto = async () => {
    try {
      setIsLoading(true)
      
      const data = {
        textQuery: hotel.name + (hotel.address ? ` ${hotel.address}` : '')
      }
      
      const result = await GetPlaceDetails(data)
      
      if (result.data.places && 
          result.data.places.length > 0 && 
          result.data.places[0].photos && 
          result.data.places[0].photos.length > 0) {
        
        // Use the first photo (more reliable) but fallback to other indexes if needed
        const photoIndex = Math.min(0, result.data.places[0].photos.length - 1)
        const photoName = result.data.places[0].photos[photoIndex].name
        const photoUrl = PHOTO_REF_URL.replace('{NAME}', photoName)
        setPhotoUrl(photoUrl)
      } else {
        // Try a more general search if the specific one failed
        const generalData = {
          textQuery: hotel.name + " hotel"
        }
        
        const generalResult = await GetPlaceDetails(generalData)
        
        if (generalResult.data.places && 
            generalResult.data.places.length > 0 && 
            generalResult.data.places[0].photos && 
            generalResult.data.places[0].photos.length > 0) {
          
          const photoName = generalResult.data.places[0].photos[0].name
          const photoUrl = PHOTO_REF_URL.replace('{NAME}', photoName)
          setPhotoUrl(photoUrl)
        } else {
          // If even the general search failed, use the hotel's image_url if available
          setPhotoUrl(hotel.image_url || '/placeholder.jpg')
        }
      }
    } catch (error) {
      console.error("Error fetching hotel photo:", error)
      // Use the hotel's existing image_url as a fallback
      setPhotoUrl(hotel.image_url || '/placeholder.jpg')
    } finally {
      setIsLoading(false)
    }
  }

  const hotelQuery = encodeURIComponent(`${hotel?.name} ${hotel?.address || ''}`.trim())

  return (
    <Link to={`https://www.google.com/maps/search/?api=1&query=${hotelQuery}`} target='_blank'>
      <div className='hover:scale-110 transition-all cursor-pointer mt-5 mb-8'>
        {isLoading ? (
          <div className='rounded-xl h-[180px] w-full bg-gray-200 animate-pulse'></div>
        ) : (
          <img 
            src={photoUrl} 
            className='rounded-xl h-[180px] w-full object-cover'
            alt={hotel?.name || "Hotel"} 
            onError={(e) => {
              // If the image fails to load, try a second approach
              if (e.target.src !== '/placeholder.jpg') {
                console.log("Trying fallback for hotel image:", hotel?.name)
                // Second attempt with a more general search
                const backupQuery = encodeURIComponent(`${hotel?.name} hotel photos`)
                setPhotoUrl(`https://source.unsplash.com/featured/?${backupQuery}`)
              }
            }}
          />
        )}
        <div className='my-2'>
          <h2 className='font-medium'>{hotel?.name}</h2>
          <h2 className='text-xs text-gray-500'>📍{hotel?.address}</h2>
          <h2 className='text-sm'>💰{hotel?.price}</h2>
          <h2 className='text-sm'>⭐{hotel?.rating}</h2>
        </div>
      </div>
    </Link>
  )
}

export default HotelCardItem