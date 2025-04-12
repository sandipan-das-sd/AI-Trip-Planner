


import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { FaPlane, FaTrain, FaBus, FaInfoCircle, FaExchangeAlt } from "react-icons/fa";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { chatSession } from '@/service/AIModel';

function TransportationOptions({ trip }) {
  const [transportData, setTransportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (trip?.userSelection?.source && trip?.userSelection?.location) {
      getTransportationOptions();
    }
  }, [trip]);

  const getTransportationOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get source and destination
      const source = trip?.userSelection?.source?.label;
      const destination = trip?.userSelection?.location?.label;
      
      const TRANSPORT_PROMPT = `Generate realistic transportation options from ${source} to ${destination}.

Focus especially on accurate details based on the specific source and destination:
- For flights: Only include if the route would realistically have flights (e.g., yes for Kolkata to Mumbai, no for Kolkata to Darjeeling)
- For trains: Include train numbers, train names, coach classes, station names
- For buses: Include bus operator names, bus types (sleeper, AC, non-AC), boarding points, drop-off points
- For all options: Include multiple departure times throughout day if available
- Include accurate frequency information (daily, weekdays only, etc)
- All prices should be in Indian Rupees (₹) format, not dollars
- Be accurate and realistic about route possibilities

Return ONLY valid JSON with this structure (no explanation text, just the JSON):
{
  "flights": [
    {"name": "Airline Name", "departure": "10:00 AM", "arrival": "12:30 PM", "duration": "2h 30m", "price": "₹5,000-7,500", "info": "Daily flights, Economy class"}
  ],
  "trains": [
    {"name": "12345 Express", "departure": "9:00 AM", "arrival": "11:30 AM", "duration": "2h 30m", "price": "₹1,500-2,500", "info": "Daily service, 2AC/3AC/Sleeper classes available, Departs from Central Station"}
  ],
  "buses": [
    {"name": "Deluxe Express", "departure": "8:00 AM", "arrival": "11:00 AM", "duration": "3h", "price": "₹800-1,200", "info": "AC Volvo, Daily, Boarding at Main Bus Terminal"}
  ]
}

If a transportation mode is not available, use an empty array like: "flights": []

Be realistic about routes - if the distance is too short for flights or too far for buses, reflect that in your response.
Also, know that flights DO exist between major cities like Kolkata and Mumbai, Delhi and Bangalore, etc.
For routes like Kolkata to Darjeeling, suggest flights to the nearest airport (like Bagdogra) if applicable.`;
      
      const result = await chatSession.sendMessage(TRANSPORT_PROMPT);
      const responseText = result?.response?.text();
      
      // Clean and parse the JSON
      try {
        // Try to extract JSON from response text (handle different formats)
        let jsonString = '';
        
        // Try to extract JSON within code blocks first
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonString = jsonMatch[1].trim();
        } else {
          // Try to find JSON between curly braces
          const curlyMatch = responseText.match(/\{[\s\S]*\}/);
          if (curlyMatch) {
            jsonString = curlyMatch[0].trim();
          } else {
            throw new Error("Could not find valid JSON in the response");
          }
        }
        
        // Parse the JSON
        const parsedData = JSON.parse(jsonString);
        
        // Ensure the data has the expected structure
        if (!parsedData.flights) parsedData.flights = [];
        if (!parsedData.trains) parsedData.trains = [];
        if (!parsedData.buses) parsedData.buses = [];
        
        setTransportData(parsedData);
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError, "Response text:", responseText);
        setError("Failed to parse transportation data. Please try again.");
        
        // Fallback to empty data structure
        setTransportData({
          flights: [],
          trains: [],
          buses: []
        });
      }
    } catch (error) {
      console.error("Error fetching transportation options:", error);
      setError("Failed to fetch transportation options. Please try again.");
      
      // Fallback to empty data structure
      setTransportData({
        flights: [],
        trains: [],
        buses: []
      });
    } finally {
      setLoading(false);
    }
  };

  const renderTransportItems = (items, icon, transportType) => {
    if (!items || items.length === 0) {
      let message = "No options available for this mode of transportation.";
      const source = trip?.userSelection?.source?.label;
      const destination = trip?.userSelection?.location?.label;
      
      // Customize message based on transport type and locations
      if (transportType === 'flights') {
        // Special case for common routes that should have flights
        const majorCities = ['Mumbai', 'Delhi', 'Kolkata', 'Chennai', 'Bangalore', 'Hyderabad', 'Pune'];
        if (majorCities.includes(source) && majorCities.includes(destination)) {
          message = `Error loading flight options between ${source} and ${destination}. Please try again.`;
        } else {
          // Check for nearby airports for popular tourist destinations
          const touristDestinations = {
            'Darjeeling': 'Bagdogra',
            'Manali': 'Kullu',
            'Ooty': 'Coimbatore',
            'Munnar': 'Cochin',
            'Shimla': 'Chandigarh'
          };
          
          if (touristDestinations[destination]) {
            message = `No direct flights to ${destination}. Consider flying to ${touristDestinations[destination]} Airport and continuing by road.`;
          } else {
            message = `No commercial flights operate between ${source} and ${destination}. Please consider alternative transportation.`;
          }
        }
      } else if (transportType === 'trains') {
        message = `No direct train routes found between ${source} and ${destination}. Consider checking for connecting trains or other modes of transportation.`;
      } else if (transportType === 'buses') {
        message = `No direct bus services found between ${source} and ${destination}. Local or connecting bus services may be available.`;
      }
      
      return (
        <div className="text-center p-6 bg-gray-50 rounded-lg my-3">
          <div className="flex justify-center mb-2 text-gray-400">
            <FaInfoCircle size={24} />
          </div>
          <p className="text-gray-500">{message}</p>
        </div>
      );
    }

    return items.map((item, index) => (
      <div key={index} className="border rounded-lg p-4 mb-3 hover:shadow-md transition-all">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <h3 className="font-bold">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.info}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium text-orange-600">{item.price}</p>
          </div>
        </div>
        <div className="mt-3 flex justify-between items-center text-sm">
          <div className="flex gap-6">
            <div>
              <p className="text-xs text-gray-500">DEPARTURE</p>
              <p className="font-medium text-gray-800">{item.departure}</p>
            </div>
            <div className="flex items-center text-gray-300">
              <FaExchangeAlt />
            </div>
            <div>
              <p className="text-xs text-gray-500">ARRIVAL</p>
              <p className="font-medium text-gray-800">{item.arrival}</p>
            </div>
          </div>
          <div className="bg-gray-100 px-3 py-1 rounded-full">
            <p className="font-medium">{item.duration}</p>
          </div>
        </div>
      </div>
    ));
  };

  if (!trip?.userSelection?.source) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 my-6">
        <p className="text-orange-700">Source location not selected. Transportation options are only available when both source and destination are specified.</p>
      </div>
    );
  }

  return (
    <div className="my-8">
      <h2 className="font-bold text-xl mb-4">Transportation Options</h2>
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="flex flex-col sm:flex-row justify-between">
          <div className="mb-2 sm:mb-0">
            <p className="text-sm text-gray-500">FROM</p>
            <p className="font-medium text-gray-700">{trip?.userSelection?.source?.label}</p>
          </div>
          <div className="hidden sm:flex items-center text-gray-300">
            <FaExchangeAlt />
          </div>
          <div>
            <p className="text-sm text-gray-500">TO</p>
            <p className="font-medium text-gray-700">{trip?.userSelection?.location?.label}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700">{error}</p>
          <Button onClick={getTransportationOptions} variant="outline" size="sm" className="mt-2">
            Try Again
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col justify-center items-center py-10">
          <AiOutlineLoading3Quarters className="h-10 w-10 animate-spin text-gray-500 mb-2" />
          <p className="text-gray-500">Searching for transportation options...</p>
        </div>
      ) : transportData ? (
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Options</TabsTrigger>
            <TabsTrigger value="flights">Flights</TabsTrigger>
            <TabsTrigger value="trains">Trains</TabsTrigger>
            <TabsTrigger value="buses">Buses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            {transportData.flights && transportData.flights.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <FaPlane /> Flight Options
                </h3>
                {renderTransportItems(transportData.flights, <FaPlane className="text-blue-500" />, 'flights')}
              </div>
            )}
            
            {transportData.trains && transportData.trains.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <FaTrain /> Train Options
                </h3>
                {renderTransportItems(transportData.trains, <FaTrain className="text-green-500" />, 'trains')}
              </div>
            )}
            
            {transportData.buses && transportData.buses.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <FaBus /> Bus Options
                </h3>
                {renderTransportItems(transportData.buses, <FaBus className="text-orange-500" />, 'buses')}
              </div>
            )}
            
            {transportData.flights.length === 0 && transportData.trains.length === 0 && transportData.buses.length === 0 && (
              <div className="text-center p-10 bg-gray-50 rounded-lg my-6">
                <div className="flex justify-center mb-4 text-gray-400">
                  <FaInfoCircle size={32} />
                </div>
                <h3 className="font-medium text-gray-700 mb-2">No transportation options found</h3>
                <p className="text-gray-500 mb-4">We couldn't find direct transportation options between these locations.</p>
                <Button onClick={getTransportationOptions} variant="outline">
                  Search Again
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="flights">
            <h3 className="font-semibold text-lg my-2 flex items-center gap-2">
              <FaPlane /> Flight Options
            </h3>
            {renderTransportItems(transportData.flights, <FaPlane className="text-blue-500" />, 'flights')}
          </TabsContent>
          
          <TabsContent value="trains">
            <h3 className="font-semibold text-lg my-2 flex items-center gap-2">
              <FaTrain /> Train Options
            </h3>
            {renderTransportItems(transportData.trains, <FaTrain className="text-green-500" />, 'trains')}
          </TabsContent>
          
          <TabsContent value="buses">
            <h3 className="font-semibold text-lg my-2 flex items-center gap-2">
              <FaBus /> Bus Options
            </h3>
            {renderTransportItems(transportData.buses, <FaBus className="text-orange-500" />, 'buses')}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-8">
          <Button onClick={getTransportationOptions}>Get Transportation Options</Button>
        </div>
      )}
    </div>
  );
}

export default TransportationOptions