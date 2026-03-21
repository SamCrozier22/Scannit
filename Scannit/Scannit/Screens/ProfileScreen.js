import React from "react";
import { View, Text, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen({setUser}) {

    async function logOut() {
        await AsyncStorage.removeItem("username")
        setUser(null)
    }
    return (
        <View>
            <Text>Profile</Text>

            <Button
                title="Logout"
                onPress={logOut}
            />
        </View>
    );
}