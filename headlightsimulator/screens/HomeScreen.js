import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
// import * as ScreenOrientation from "expo-screen-orientation";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   const lockOrientation = async () => {
  //     await ScreenOrientation.lockAsync(
  //       ScreenOrientation.OrientationLock.LANDSCAPE
  //     );
  //   };
  //   lockOrientation();
  // }, []);

  const handleImageLoad = () => {
    setIsLoading(false);
    setTimeout(() => {
      navigation.navigate("FileList");
    }, 2000); // Wait 2 seconds before navigating
  };

  return (
    <View style={styles.container}>
      {isLoading && (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      )}
      <ImageBackground
        source={require("../assets/bg1.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
        onLoadEnd={handleImageLoad} // Ensures image is fully loaded
        onError={(error) => console.error("Failed to load image:", error)}
      />
    </View>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  backgroundImage: {
    width: width,
    height: height,
    position: "absolute",
  },
  loader: {
    position: "absolute",
    top: "50%",
  },
});
