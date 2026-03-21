import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen({setUser}) {

    async function logOut() {
        await AsyncStorage.removeItem("username")
        setUser(null)
    }
    return (
        <View style={styles.container}>
            <Text>Profile</Text>

            <Button
                title="Logout"
                onPress={logOut}
            />
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#C3B59F",
    }
})