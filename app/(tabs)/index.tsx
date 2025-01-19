import { Image, StyleSheet, Platform, View } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import Location from '@/components/Location';

export default function HomeScreen() {
  return (
      <Location/>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
