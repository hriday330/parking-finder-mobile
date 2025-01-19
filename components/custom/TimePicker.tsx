import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TimePickerProps {
  value: string; // The value for the time (HH:mm format)
  onChange: (selectedTime: string) => void; // Function to handle time change
  label?: string; // Optional label for the time picker
  labelStyle?: object; // Optional custom styles for the label
  inputStyle?: object; // Optional custom styles for the input
}

const TimePicker = ({ value, onChange, label = 'Select Time', labelStyle, inputStyle }: TimePickerProps) => {
  const [show, setShow] = useState(false);

  const handleChange = (event: any, selectedDate: Date | undefined) => {
    setShow(false); // Hide picker after selection
    if (selectedDate) {
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      onChange(formattedTime);
    }
  };

  const togglePicker = () => {
    setShow(true);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      <TouchableOpacity style={[styles.inputContainer, inputStyle]} onPress={togglePicker}>
        <Text style={styles.timeText}>{value}</Text>
      </TouchableOpacity>

      {show && (
        <Modal transparent={true} animationType="slide" visible={show}>
          <View style={styles.modalContainer}>
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={new Date(`1970-01-01T${value}:00`)} // Use the provided time value
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleChange}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity onPress={() => setShow(false)} style={styles.doneButton}>
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  label: {
    fontSize: 20,
    fontWeight: '500',
    color: '#4A4A4A',
    marginBottom: 5,
  },
  inputContainer: {
    backgroundColor: '#F0F0F0',
    color: 'black',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 20,
    color: 'black',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: 'black',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  doneButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  doneButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TimePicker;
