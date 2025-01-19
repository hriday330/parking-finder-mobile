import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function StyledButton({onPress, labelText}) {
    return(<TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.label}>{labelText}</Text>
      </TouchableOpacity>)
} 

const styles = StyleSheet.create({
    button : {
        backgroundColor: 'rgba(192, 211, 115, 1)',
        width: 200,
        alignItems: "center",
        justifyContent: "center",
        height: 100
    },
    label: {
        color: 'black',
        flex: 0.3,
        fontSize: 24,
        fontWeight: '800',
        borderRadius: "20"
    }
})