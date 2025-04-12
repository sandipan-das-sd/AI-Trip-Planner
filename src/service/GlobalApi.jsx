// import axios from "axios"

// const BASE_URL='https://places.googleapis.com/v1/places:searchText'

// const config={
//     headers:{
//         'Content-Type': 'application/json',
//         'X-Goog-Api-Key': import.meta.env.VITE_GOOGLE_PLACE_API_KEY,
//         'X-Goog-FieldMask': [
//             'places.photos',
//             'places.displayName',
//             'places.id'
//         ]
//     }
// }

// export const GetPlaceDetails=(data)=>axios.post(BASE_URL,data,config)

// export const PHOTO_REF_URL = 'https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=1000&maxWidthPx=1900&key=' + import.meta.env.VITE_GOOGLE_PLACE_API_KEY

import axios from "axios";

const BASE_URL = 'https://places.googleapis.com/v1/places:searchText';

const config = {
  headers: {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': import.meta.env.VITE_GOOGLE_PLACE_API_KEY,
    'X-Goog-FieldMask': [
      'places.photos',
      'places.displayName',
      'places.id',
      'places.formattedAddress'
    ]
  }
};

// Safely make API calls with validation
export const GetPlaceDetails = (data) => {
  // Ensure textQuery is not empty to prevent 400 errors
  if (!data.textQuery || data.textQuery.trim() === '') {
    console.error('Empty text query provided to GetPlaceDetails');
    return Promise.reject(new Error('Empty text query'));
  }
  
  return axios.post(BASE_URL, data, config);
};

export const PHOTO_REF_URL = 'https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=1000&maxWidthPx=1900&key=' + import.meta.env.VITE_GOOGLE_PLACE_API_KEY;