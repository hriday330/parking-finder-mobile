import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TimePickerProps {
  value: string; // The value for the time
  onChange: (event: any, selectedDate: Date | undefined) => void; // Function to handle time change
  label?: string; // Optional label for the time picker
  labelStyle?: object; // Optional custom styles for the label
  inputStyle?: object; // Optional custom styles for the input
}

const TimePicker = ({ value, onChange, label = 'Select Time', labelStyle, inputStyle }: TimePickerProps) => {
  const [show, setShow] = React.useState(false);

  const handleChange = (event: any, selectedDate: Date | undefined) => {
    setShow(Platform.OS === 'ios'); // Hide picker for iOS after selection
    onChange(event, selectedDate);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      <View style={[styles.inputContainer, inputStyle]}>
        <Text style={styles.timeText}>{value}</Text>
        <DateTimePicker
          value={new Date(`1970-01-01T${value}:00`)} // Use the provided time value
          mode="time"
          is24Hour={true}
          display="spinner"
          onChange={handleChange}
          style={styles.picker}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A4A4A',
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  picker: {
    width: 200,
    height: 150,
    display: 'none', // Hide picker in normal view until interaction
  },
});

export default TimePicker;
