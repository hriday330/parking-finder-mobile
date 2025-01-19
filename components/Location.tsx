import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions, ImageSourcePropType } from 'react-native';

type LocationEntry = {
  name: string;
  imageSrc: ImageSourcePropType;
  link?: string;
};

const ButtonCard = ({ imageSrc, labelText, onPress }: {
  imageSrc: ImageSourcePropType;
  labelText: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image
      source={imageSrc}
      style={styles.cardImage}
      resizeMode="cover"
    />
    <Text style={styles.cardLabel}>{labelText}</Text>
  </TouchableOpacity>
);

const Location = () => {
  const locations: LocationEntry[] = [
    { 
      name: 'Downtown', 
      link: '/', 
      imageSrc: require('../assets/images/vancouver.jpg')
    },
    { 
      name: 'SFU', 
      link: '/', 
      imageSrc: require('../assets/images/sfu.jpg')
    },
    { 
      name: 'UBC', 
      link: '/', 
      imageSrc: require('../assets/images/ubc.jpg')
    },
    { 
      name: 'Richmond', 
      link: '/', 
      imageSrc: require('../assets/images/richmond.webp')
    },
    { 
      name: 'Burnaby', 
      link: '/', 
      imageSrc: require('../assets/images/burnaby.jpg')
    },
    { 
      name: 'Coquitlam', 
      link: '/', 
      imageSrc: require('../assets/images/coquitlam.jpg')
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.mascotContainer}>
          
        </View>

        <View style={styles.mainContent}>
          <Text style={styles.title}>Where do you want to go?</Text>
          
          <View style={styles.grid}>
            {locations.map((location) => (
              <ButtonCard
                key={location.name}
                imageSrc={location.imageSrc}
                labelText={location.name}
                onPress={() => {
                  console.log(`Selected location: ${location.name}`);
                }}
              />
            ))}
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => {
              console.log('Navigate to plan trip');
            }}
          >
            <Text style={styles.buttonText}>Are you looking elsewhere?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#FCECAB'
  },
  content: {
    flexDirection: 'column',
    padding: 16,
  },
  mascotContainer: {
    marginRight: 16,
  },
  mascotImage: {
    width: 64,
    height: 200,
    marginTop: 20,
  },
  mainContent: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    width: cardWidth,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardImage: {
    width: '100%',
    height: cardWidth,
  },
  cardLabel: {
    padding: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginVertical: 40,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Location;