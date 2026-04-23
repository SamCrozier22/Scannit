import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./navigation/RootNavigator";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { BaseToast, ErrorToast, InfoToast } from "react-native-toast-message";

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#108A2C",
        backgroundColor: "#2D4739",
        height: 100
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontWeight: "bold",
        color: "#108A2C",
      }}
      text2Style={{
        fontWeight: "bold",
        color: "#108A2C",
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#fa4437",
        backgroundColor: "#2D4739",
        height: 100
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 20,
        fontWeight: "bold",
        color: "#fa4437",
      }}
      text2Style={{
        fontSize: 16,
        fontWeight: "bold",
        color: "#fa4437",
      }}

    />
  ),
  info: (props) => (
    <InfoToast
      {...props}
      style={{
        borderLeftColor: "#108A2C",
        backgroundColor: "#2D4739",
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 20,
        fontWeight: "bold",
        color: "#108A2C",
      }}
      text2Style={{
        fontSize: 16,
        fontWeight: "bold",
        color: "#108A2C",
      }}
    />
  )
}
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      <Toast config={toastConfig} />
    </GestureHandlerRootView>
  );
}