
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GetPlaceDetails, PHOTO_REF_URL } from '@/service/GlobalApi'
import { FaMapMarkerAlt, FaTicketAlt, FaStar, FaClock, FaInfoCircle } from 'react-icons/fa'

// Realistic fallback images by category
const FALLBACK_IMAGES = {
  default: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop',
  temple: 'https://images.unsplash.com/photo-1509516425643-320d8495c4ff?w=800&auto=format&fit=crop',
  monument: 'https://images.unsplash.com/photo-1602430080148-66d65c069dd5?w=800&auto=format&fit=crop',
  mountain: 'https://images.unsplash.com/photo-1486082570281-d942af5c39b7?w=800&auto=format&fit=crop',
  beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop',
  garden: 'https://images.unsplash.com/photo-1508252592163-5d3c3c559194?w=800&auto=format&fit=crop',
  park: 'https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=800&auto=format&fit=crop',
  fort: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop',
  palace: 'https://images.unsplash.com/photo-1599522336242-0e1820d1380e?w=800&auto=format&fit=crop',
  museum: 'https://images.unsplash.com/photo-1574271005251-2875e769f6a2?w=800&auto=format&fit=crop',
  lighthouse: 'https://images.unsplash.com/photo-1566236202825-62edfc640de3?w=800&auto=format&fit=crop',
  market: 'https://images.unsplash.com/photo-1520006403909-838d6b92c22e?w=800&auto=format&fit=crop',
  waterfall: 'https://images.unsplash.com/photo-1467890947394-8171244e5410?w=800&auto=format&fit=crop',
  lake: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop',
  hill: 'https://images.unsplash.com/photo-1486082570281-d942af5c39b7?w=800&auto=format&fit=crop',
  tower: 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&auto=format&fit=crop',
  bridge: 'https://images.unsplash.com/photo-1473221326025-9183b464bb7e?w=800&auto=format&fit=crop',
  cave: 'https://images.unsplash.com/photo-1626688455375-b9162a2d3de5?w=800&auto=format&fit=crop'
};

// Get appropriate fallback image based on place name
const getFallbackImage = (placeName) => {
  if (!placeName) return FALLBACK_IMAGES.default;
  
  const name = placeName.toLowerCase();
  
  if (name.includes('temple') || name.includes('mandir') || name.includes('monastery'))
    return FALLBACK_IMAGES.temple;
  if (name.includes('monument') || name.includes('memorial') || name.includes('statue'))
    return FALLBACK_IMAGES.monument;
  if (name.includes('mountain') || name.includes('peak') || name.includes('point'))
    return FALLBACK_IMAGES.mountain;
  if (name.includes('beach') || name.includes('sea') || name.includes('ocean'))
    return FALLBACK_IMAGES.beach;
  if (name.includes('garden') || name.includes('botanical'))
    return FALLBACK_IMAGES.garden;
  if (name.includes('park') || name.includes('national park'))
    return FALLBACK_IMAGES.park;
  if (name.includes('fort') || name.includes('fortress'))
    return FALLBACK_IMAGES.fort;
  if (name.includes('palace') || name.includes('mahal') || name.includes('castle'))
    return FALLBACK_IMAGES.palace;
  if (name.includes('museum') || name.includes('gallery'))
    return FALLBACK_IMAGES.museum;
  if (name.includes('lighthouse') || name.includes('beacon'))
    return FALLBACK_IMAGES.lighthouse;
  if (name.includes('market') || name.includes('bazaar') || name.includes('mall'))
    return FALLBACK_IMAGES.market;
  if (name.includes('waterfall') || name.includes('falls'))
    return FALLBACK_IMAGES.waterfall;
  if (name.includes('lake') || name.includes('pond') || name.includes('reservoir'))
    return FALLBACK_IMAGES.lake;
  if (name.includes('hill') || name.includes('hills') || name.includes('highland'))
    return FALLBACK_IMAGES.hill;
  if (name.includes('tower') || name.includes('spire'))
    return FALLBACK_IMAGES.tower;
  if (name.includes('bridge') || name.includes('crossing'))
    return FALLBACK_IMAGES.bridge;
  if (name.includes('cave') || name.includes('cavern') || name.includes('grotto'))
    return FALLBACK_IMAGES.cave;
    
  return FALLBACK_IMAGES.default;
};

function PlaceCardItem({place}) {
  const [photoUrl, setPhotoUrl] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

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
              // Use category-specific fallback image
              setPhotoUrl(getFallbackImage(place.place))
            }
          }
        } catch (backupError) {
          console.error("Error in backup photo search:", backupError)
          setPhotoUrl(getFallbackImage(place.place))
        }
      }
    } catch (error) {
      console.error("Error fetching place photo:", error)
      // Use category-specific fallback image
      setPhotoUrl(getFallbackImage(place.place))
    } finally {
      setIsLoading(false)
    }
  }

  // Use coordinates in map link if available for better accuracy
  const mapQuery = place?.geo_coordinates 
    ? encodeURIComponent(place.geo_coordinates)
    : encodeURIComponent(place?.place || '')

  // Get rating stars (if available)
  const renderRatingStars = () => {
    if (!place?.rating) return null;
    
    const rating = parseFloat(place.rating);
    if (isNaN(rating)) return null;
    
    return (
      <div className="flex items-center mt-1">
        {[...Array(5)].map((_, i) => (
          <FaStar 
            key={i} 
            className={`${i < rating ? 'text-yellow-400' : 'text-gray-300'} text-xs mr-1`} 
          />
        ))}
        <span className="text-xs ml-1 text-gray-600">{place.rating}</span>
      </div>
    );
  };

  // Handle image error
  const handleImageError = () => {
    // Use a category-specific fallback
    setPhotoUrl(getFallbackImage(place.place))
  };

  return (
    <Link to={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target='_blank'>
      <div className='bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] border border-gray-100'>
        {/* Image section */}
        <div className="relative">
          {isLoading ? (
            <div className='h-[180px] w-full bg-gray-200 animate-pulse'></div>
          ) : (
            <>
              <img 
                src={photoUrl} 
                alt={place?.place || "Place image"} 
                className='h-[180px] w-full object-cover'
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              
              {/* Favorite button */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setIsFavorite(!isFavorite);
                }}
                className="absolute top-3 right-3 bg-white/70 hover:bg-white p-2 rounded-full backdrop-blur-sm transition-all"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  fill="none"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                  />
                </svg>
              </button>
              
              {/* Location badge */}
              {place?.geo_coordinates && (
                <div className="absolute top-3 left-3 bg-blue-500/80 text-white text-xs py-1 px-2 rounded-lg backdrop-blur-sm flex items-center">
                  <FaMapMarkerAlt className="mr-1" />
                  <span>Map</span>
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 className='font-bold text-lg text-white drop-shadow-md'>{place?.place}</h2>
                {place?.time && (
                  <div className="flex items-center text-white text-xs mt-1">
                    <FaClock className="mr-1" />
                    <div className="bg-orange-500/80 py-1 px-2 rounded-full backdrop-blur-sm inline-block">
                      {place.time}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* Content section */}
        <div className='p-4'>
          <p className='text-sm text-gray-600 line-clamp-2 min-h-[40px]'>{place?.details}</p>
          
          <div className="border-t border-gray-100 mt-3 pt-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center text-sm text-gray-500">
                <div className="bg-orange-100 p-1.5 rounded-lg mr-2">
                  <FaTicketAlt className="text-orange-500 text-xs" />
                </div>
                <span>{place?.ticket_pricing || "Free Entry"}</span>
              </div>
              
              <div className="flex items-center bg-blue-50 hover:bg-blue-100 transition-colors px-2 py-1 rounded-lg">
                <FaMapMarkerAlt className="mr-1 text-blue-500" />
                <span className="text-blue-600 text-xs font-medium">View on Map</span>
              </div>
            </div>
            
            {renderRatingStars()}
            
            {/* Additional info button */}
            <div className="mt-3 text-center">
              <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center w-full">
                <FaInfoCircle className="mr-1" />
                <span>More Details</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Visit tag */}
        {parseFloat(place?.rating) >= 4.5 && (
  <div className="absolute -right-1 -top-1 bg-gradient-to-br from-green-400 to-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg transform rotate-0 shadow-md">
    MUST VISIT
  </div>
)}
      </div>
    </Link>
  )
}

export default PlaceCardItem