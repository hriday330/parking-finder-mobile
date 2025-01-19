import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import TimePicker from "@/components/custom/TimePicker"; // Custom TimePicker component
import SearchBar from "@/components/custom/SearchBar";

const YOUR_MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoiaHJpZGF5MzMwIiwiYSI6ImNtNjJ5bDJxYjEyaWMybm9rYW5hbGtsam0ifQ.sjy7xcIkwP1i4vPum4M_1g";
const PlanTrip = () => {
  const [searchItem, setSearchItem] = useState("");
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("12:00");
  const [suggestions, setSuggestions] = useState([]);
  const [mapRegion, setMapRegion] = useState({
    latitude: 49.26517,
    longitude: -123.16652,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [parkingLotMarkers, setParkingLotMarkers] = useState([]);
  const [parkingLots, setParkingLots] = useState([]);
  const [selectedParkingLot, setSelectedParkingLot] = useState<Record<string,unknown>| null>(null);

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

    try {
      const response = await fetch(
        `https://opendata.vancouver.ca/api/records/1.0/search/?dataset=parking-meters&geofilter.distance=${center[1]},${center[0]},2000`
      );
      const data = await response.json();

      if (data.records && data.records.length > 0) {
        const closestFive = data.records.slice(0,5);
        const addresses = await Promise.all(closestFive.map(async (item) => {
          const {coordinates} = item.fields.geom;
          const addr = await getAddressFromCoordinates(coordinates[0], coordinates[1]);
          return addr;
        }));
        const closestParkingLots = closestFive
          .map((record: any, index: number) => ({
            coordinates: record.fields.geom.coordinates,
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
            address: addresses[index]
          }));

        setParkingLots(closestParkingLots);
      }
    } catch (error) {
      console.error("Error fetching parking lots:", error);
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
    <View style={{ flex: 1, padding: 16, backgroundColor: 'white' }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Destination</Text>
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
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TimePicker value={startTime} onChange={setStartTime} label="Depart at" />
        <TimePicker value={endTime} onChange={setEndTime} label="Arrive at" />
      </View>

      <MapView
        style={{ height: 300 }}
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
      >
        {parkingLots.map((lot, index) => (
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
            padding: 16,
            backgroundColor: "white",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "gray",
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>
            {selectedParkingLot.name}
          </Text>
          <Text style={{ marginVertical: 8 }}>
            Time In Effect: {selectedParkingLot.timeInEffect}
          </Text>
          <Text style={{ marginVertical: 8 }}>
            Distance: {selectedParkingLot.distance}
          </Text>
          <Text style={{ marginVertical: 8 }}>Address: {selectedParkingLot.address}</Text>
          <Text style={{ marginVertical: 8, fontWeight: "bold" }}>Rates:</Text>
          {selectedParkingLot.rates.map((rate, index) => (
            <Text key={index} style={{ marginVertical: 4 }}>
              {rate.type}: {rate.rate}
            </Text>
          ))}
          <Button title="Let's go!" onPress={() => {}} />
        </View>
      )}
      <Text>{selectedParkingLot ? 'yes' : 'no'}</Text>
    </View>
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
