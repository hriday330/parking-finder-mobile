import React from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch: () => void;
};

function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  onSearch,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        style={styles.input}
      />
      <TouchableOpacity onPress={onSearch} style={styles.button}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginTop: 15,
    alignItems: "center",
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#3498db",
    borderRadius: 8,
    backgroundColor: 'white',
    flex: 1,
    marginRight: 10,
    fontSize: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "'rgba(192, 211, 115, 1)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "black",
    fontSize: 16,
    fontWeight: 'bold'
  },
});

export default SearchBar;
