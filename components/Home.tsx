import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions, ImageSourcePropType, Button } from 'react-native';
import StyledButton from './ui/Button';

const Home = () => {
  return (
    <ScrollView style={styles.container}>
        <View style={{...styles.bannerContainer,alignItems:'center', marginTop: 100, paddingRight: 20}}>
        <Image
          source={require('../assets/images/spotCheck.png')}
          style={{...styles.bannerImage, height: '125%', width: '125%'
          }}
          
        />
      </View>
      <View style={{...styles.bannerContainer, alignSelf: 'center' , height: '90%', width: '80%'}}>
      <Image
          source={require('../assets/images/mascotMobile.png')}
          style={styles.bannerImage}
        />
      </View>
      <View style={{alignSelf: 'center', marginTop:30, height:"90%", width:'100%'}}>
      <Image
          source={require('../assets/images/city.png')}
          style={styles.bannerImage}
          
        />
      </View>
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(192, 211, 115, 1)'
  },
  container: {
    flex: 1,
    backgroundColor: '#F9F0DE'
  },
  bannerContainer: {
    width: '100%',
    height: 200,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flexDirection: 'column',
    padding: 16,
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
    justifyContent: 'space-evenly',
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

export default Home;
