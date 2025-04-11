import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { FaPlane, FaTrain, FaBus } from "react-icons/fa";
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
      
      const TRANSPORT_PROMPT = `Generate transportation options from ${trip?.userSelection?.source?.label} to ${trip?.userSelection?.location?.label}.

Return ONLY valid JSON with this structure (no explanation text, just the JSON):
{
  "flights": [
    {"name": "Airline Name", "departure": "10:00 AM", "arrival": "12:30 PM", "duration": "2h 30m", "price": "$100-150", "info": "Daily flights"}
  ],
  "trains": [
    {"name": "Train Company", "departure": "9:00 AM", "arrival": "11:30 AM", "duration": "2h 30m", "price": "$50-80", "info": "Comfortable seats"}
  ],
  "buses": [
    {"name": "Bus Service", "departure": "8:00 AM", "arrival": "11:00 AM", "duration": "3h", "price": "$30-45", "info": "Air conditioned"}
  ]
}

If a transportation mode is not available, include it with an empty array like: "flights": []`;
      
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

  const renderTransportItems = (items, icon) => {
    if (!items || items.length === 0) {
      return (
        <div className="text-center p-4 bg-gray-50 rounded-lg my-3">
          <p className="text-gray-500">No options available for this mode of transportation.</p>
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
          <div>
            <p className="font-medium">Departure: <span className="text-gray-600">{item.departure}</span></p>
            <p className="font-medium">Arrival: <span className="text-gray-600">{item.arrival}</span></p>
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
        <p className="font-medium">From: <span className="text-gray-700">{trip?.userSelection?.source?.label}</span></p>
        <p className="font-medium">To: <span className="text-gray-700">{trip?.userSelection?.location?.label}</span></p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <AiOutlineLoading3Quarters className="h-10 w-10 animate-spin text-gray-500" />
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
                {renderTransportItems(transportData.flights, <FaPlane className="text-blue-500" />)}
              </div>
            )}
            
            {transportData.trains && transportData.trains.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <FaTrain /> Train Options
                </h3>
                {renderTransportItems(transportData.trains, <FaTrain className="text-green-500" />)}
              </div>
            )}
            
            {transportData.buses && transportData.buses.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <FaBus /> Bus Options
                </h3>
                {renderTransportItems(transportData.buses, <FaBus className="text-orange-500" />)}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="flights">
            <h3 className="font-semibold text-lg my-2 flex items-center gap-2">
              <FaPlane /> Flight Options
            </h3>
            {renderTransportItems(transportData.flights, <FaPlane className="text-blue-500" />)}
          </TabsContent>
          
          <TabsContent value="trains">
            <h3 className="font-semibold text-lg my-2 flex items-center gap-2">
              <FaTrain /> Train Options
            </h3>
            {renderTransportItems(transportData.trains, <FaTrain className="text-green-500" />)}
          </TabsContent>
          
          <TabsContent value="buses">
            <h3 className="font-semibold text-lg my-2 flex items-center gap-2">
              <FaBus /> Bus Options
            </h3>
            {renderTransportItems(transportData.buses, <FaBus className="text-orange-500" />)}
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