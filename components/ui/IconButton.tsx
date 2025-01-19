import React, { useState } from 'react';
import { TouchableOpacity, Image, StyleSheet, ImageSourcePropType, GestureResponderEvent, ViewStyle } from 'react-native';

type IconButtonProps = {
  image: ImageSourcePropType;
  size?: number; 
  onPress?: (event: GestureResponderEvent) => void; // Function called when the button is pressed
  style?: ViewStyle; // Additional custom styles for the button
};

const IconButton: React.FC<IconButtonProps> = ({
  image,
  size = 100, // Default size of the button
  onPress,
  style,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { 
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isPressed ? '#e0e0e0' : '#f0f0f0', // Darken on press
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={1}
      onPressIn={() => setIsPressed(true)} // Set active state when pressed
      onPressOut={() => setIsPressed(false)} // Reset active state when released
    >
      <Image source={image} style={[styles.image, { width: size * 0.9, height: size * 0.9 }]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // For shadow on Android
    shadowColor: '#000', // For shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    resizeMode: 'contain',
  },
});

export default IconButton;
