import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  TransitionPresets,
} from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import ConnectTheDotsScreen from "./screens/ConnectTheDots";
import FileListScreen from "./screens/FileListScreen";
import { useFonts } from "expo-font";
import * as ScreenOrientation from "expo-screen-orientation";
// Initialize the Stack navigator
const Stack = createNativeStackNavigator();

export default function App() {
  // useEffect(() => {
  //   // Lock screen orientation to landscape
  //   ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  // }, []);
  const [fontsLoaded] = useFonts({
    "Alata-Regular": require("./assets/fonts/Alata-Regular.ttf"),
    "fFinish-Regular": require("./assets/fonts/Finish-PKYqB.otf"),
    // Add more fonts here if needed
  });
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // Hide headers for all screens
          animation: "fade", // Use fade transition
        }}
        initialRouteName="HomeScreen"
      >
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ConnectTheDots"
          component={ConnectTheDotsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FileList"
          component={FileListScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
