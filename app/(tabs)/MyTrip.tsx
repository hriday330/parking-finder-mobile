import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, TextInput, Button, FlatList, TouchableOpacity, Alert, StyleSheet, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import TimePicker from "@/components/custom/TimePicker";
import SearchBar from "@/components/custom/SearchBar";
import IconButton from "@/components/ui/IconButton";

const YOUR_MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoiaHJpZGF5MzMwIiwiYSI6ImNtNjJ5bDJxYjEyaWMybm9rYW5hbGtsam0ifQ.sjy7xcIkwP1i4vPum4M_1g";
const PlanTrip = () => {
  const [searchItem, setSearchItem] = useState("");
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("12:00");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSearch, setSelectedSearch] = useState<"cars" | "motorcycles" | "disabled">("cars");
  const [mapRegion, setMapRegion] = useState({
    latitude: 49.26517,
    longitude: -123.16652,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [parkingLotMarkers, setParkingLotMarkers] = useState([]);
  const [parkingLots, setParkingLots] = useState([]);
  const [selectedParkingLot, setSelectedParkingLot] = useState<Record<string,any>| null>(null);

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const handleParkingLotClick = (lot: any) => {
    setSelectedParkingLot(lot);
  };

  const fetchSuggestions = debounce(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${YOUR_MAPBOX_ACCESS_TOKEN}&autocomplete=true&limit=5`
      );
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  }, 300);

  const fetchParkingLots = async (center: [number, number]) => {
    setParkingLotMarkers([]);
  
    const isNearCampus = (lat: number, lng: number, campus: { name: string; coords: [number, number] }, radius: number) => {
      const distance = haversineDistance([lng, lat], campus.coords);
      return distance <= radius;
    };
  
    // Define UBC and SFU campus coordinates
    const campuses = [
      { name: "ubc", coords: [49.2606, -123.2460] }, // UBC
      // { name: "SFU", coords: [49.2796, -122.9199] }, // SFU
    ];
  
    let closestParkingLots:any[];
    const nearCampus = campuses.find((campus) =>
      isNearCampus(center[1], center[0], campus, 2) // Within 2 km of the campus
    );
    
    try {
      if (nearCampus) {
        console.log(`Center is near ${nearCampus.name}, calling our own API to get live data`);
        setTimeout(() => {
        }, 400);
        
        closestParkingLots = [{
          coordinates: [center[0], center[1]],
          spaces: 8 ?? 'Space data not available for this lot', 
          distance: `0.3km`,
          name: "Demo parking lot",
          rates: [
            { type: "Mon-Fri 9a-6p", rate: "$4/hr"},
            { type: "Sat 9a-6p", rate: "$4/hr"},
            { type: "Mon-Fri 6p-10p", rate: "$4/hr"},
            { type: "Sat 6p-10p", rate: "$4/hr" },
            { type: "Sun 9a-6p", rate: "$4/hr" },
          ],
          timeInEffect: '9am-6pm',
          address:'UBC'
        }];
      }
  
      // Otherwise, call the default Vancouver parking meters API
      let vancouverDataSource;
      if (selectedSearch === "disabled") {
        vancouverDataSource = `https://opendata.vancouver.ca/api/records/1.0/search/?dataset=disability-parking&geofilter.distance=${center[1]},${center[0]},2000`
      } else if (selectedSearch === "motorcycles") {
        vancouverDataSource = `https://opendata.vancouver.ca/api/records/1.0/search/?dataset=motorcycle-parking&geofilter.distance=${center[1]},${center[0]},2000`
      } else {
        vancouverDataSource = `https://opendata.vancouver.ca/api/records/1.0/search/?dataset=parking-meters&geofilter.distance=${center[1]},${center[0]},2000`
      }
      const response = await fetch(
        vancouverDataSource
      );
  
      const data = await response.json();
  
    
      if (data.records && data.records.length > 0) {
        const closestFive = data.records.slice(0, 5);
        const addresses = await Promise.all(
          closestFive.map(async (item: any) => {
            const { coordinates } = item.fields.geom;
            let addr;
            if (item.fields?.location) {
              addr = item.fields.location;
            } else {
              addr = await getAddressFromCoordinates(coordinates[0], coordinates[1]);
            }
            return addr;
          })
        );
        closestParkingLots = closestFive.map((record: any, index: number) => ({
          coordinates: record.fields.geom.coordinates,
          spaces: record.fields?.spaces ?? 'Space data not available for this lot', 
          distance: `${haversineDistance(center, record.fields.geom.coordinates).toFixed(1)} km`,
          name: record.fields.meter_id || "Parking Meter",
          rates: [
            { type: "Mon-Fri 9a-6p", rate: record.fields.r_mf_9a_6p },
            { type: "Sat 9a-6p", rate: record.fields.r_sa_9a_6p },
            { type: "Mon-Fri 6p-10p", rate: record.fields.r_mf_6p_10 },
            { type: "Sat 6p-10p", rate: record.fields.r_sa_6p_10 },
            { type: "Sun 9a-6p", rate: record.fields.r_su_9a_6p },
          ],
          timeInEffect: record.fields.timeineffe,
          address: addresses[index],
        }));

        console.log(closestParkingLots)
  
        setParkingLots(closestParkingLots);
      }
    } catch (error) {
      console.error(error);
    }  
  };

  const handleSearchChange = (value: string) => {
    setSearchItem(value);
    fetchSuggestions(value);
  };

  const handleSearch = async () => {
    if (!searchItem.trim()) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchItem
        )}.json?access_token=${YOUR_MAPBOX_ACCESS_TOKEN}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const { center, place_name } = data.features[0];
        setMapRegion({
          ...mapRegion,
          latitude: center[1],
          longitude: center[0],
        });

        await fetchParkingLots(center);
      } else {
        Alert.alert("Location not found");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  const handleSuggestionClick = async (suggestion: any) => {
    const { center, place_name } = suggestion;

    setSearchItem(place_name);
    setSuggestions([]);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchItem
        )}.json?access_token=${YOUR_MAPBOX_ACCESS_TOKEN}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const {center} = data.features[0]
        setMapRegion({
          ...mapRegion,
          latitude: center[1],
          longitude: center[0],
        });

        await fetchParkingLots(center);
      } else {
        Alert.alert("Location not found");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  useEffect(() => {
    if (mapRegion.latitude && mapRegion.longitude) {
      fetchParkingLots([mapRegion.latitude, mapRegion.longitude]);
    }
  }, [mapRegion]);

  const getAddressFromCoordinates = async (longitude: number, latitude: number) => {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${YOUR_MAPBOX_ACCESS_TOKEN}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        return address;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      return null;
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F9F0DE' }}>
    
      <View style={styles.bannerContainer}>
        <Image
          source={require('../../assets/images/banner.webp')}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      </View>
      <View style={{ marginBottom: 16, paddingHorizontal: 18, paddingTop: 36}}>
        <Text style={{ fontSize: 36, paddingVertical: 6, fontWeight: "bold" }}>Destination</Text>
        <SearchBar
              value={searchItem}
              onSearch={handleSearch}
              onChange={handleSearchChange}
              placeholder="Where do you want to go?"
            />
        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            renderItem={({ item }: any) => (
              <TouchableOpacity onPress={() => handleSuggestionClick(item)}>
                <Text style={{ padding: 8, borderBottomWidth: 1 }}>
                  {item.place_name}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        )}
        <Text> Selected search: {selectedSearch} </Text>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 36 }}>
        <IconButton image={require('../../assets/images/handicap.webp')} onPress={() => setSelectedSearch("disabled")} />
        <IconButton image={require('../../assets/images/motorcycles.webp')} onPress={() => setSelectedSearch("motorcycles")} />
        <IconButton image={require('../../assets/images/cars.webp')} onPress={() => setSelectedSearch("cars")} />
      </View>

      <MapView
        style={{ height: 300, paddingHorizontal: 14, paddingTop: 16, borderRadius: 20 }}
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
      >
        {parkingLots.map((lot: any, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: lot.coordinates[1],
              longitude: lot.coordinates[0],
            }}
            title={lot.name}
            description={`Distance: ${lot.distance}`}
            onPress={() => handleParkingLotClick(lot)}
          />
        ))}
      </MapView>

      {selectedParkingLot && (
        <View
        style={{
          marginTop: 16,
          marginHorizontal: 10,
          padding: 20,
          backgroundColor: "#f9f9f9",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#ddd",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#333",
            marginBottom: 12,
          }}
        >
          {selectedParkingLot.name}
        </Text>
        <Text style={{ fontSize: 16, color: "#555", marginBottom: 8 }}>
          ⏰ Time In Effect: <Text style={{ fontWeight: "bold", color: "#000" }}>{selectedParkingLot.timeInEffect}</Text>
        </Text>
        <Text style={{ fontSize: 16, color: "#555", marginBottom: 8 }}>
          📍 Distance: <Text style={{ fontWeight: "bold", color: "#000" }}>{selectedParkingLot.distance}</Text>
        </Text>
          🏠 Address: <Text style={{ fontWeight: "bold", color: "#000" }}>{selectedParkingLot.address}</Text>
          <Text style={{ fontSize: 16, color: "#555", marginBottom: 8 }}>
          🏠 Spaces: <Text style={{ fontWeight: "bold", color: "#000" }}>{selectedParkingLot?.spaces}</Text>
        </Text>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 12 }}>
          💵 Rates:
        </Text>
        {selectedParkingLot.rates.map((rate:any, index:number) => (
          <Text
            key={index}
            style={{
              fontSize: 16,
              color: "#555",
              marginBottom: 6,
              paddingLeft: 8,
            }}
          >
            • {rate.type}: <Text style={{ fontWeight: "bold", color: "#000" }}>{rate.rate}</Text>
          </Text>
        ))}
        <TouchableOpacity
          style={{
            marginTop: 16,
            backgroundColor: "rgba(192, 211, 115, 1)",
            padding: 12,
            borderRadius: 8,
            alignItems: "center",
          }}
          onPress={() => {}}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: "black" }}>
            Let’s go!
          </Text>
        </TouchableOpacity>
      </View>
      
      )}
    </ScrollView>
  );
};

export default PlanTrip;


const haversineDistance = (coord1: [number, number], coord2: [number, number]) => {
  const R = 6371; // Radius of Earth in km
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;

  const toRad = (degree: number) => (degree * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in kilometers
};

const styles = StyleSheet.create(
  {
    bannerContainer: {
      width: '100%',
      height: 200,
  },
    bannerImage: {
      width: '100%',
      height: '100%',
  },}
)