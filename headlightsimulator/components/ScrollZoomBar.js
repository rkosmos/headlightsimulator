import React, { useState, useCallback } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Slider from "@react-native-community/slider";
const { width, height } = Dimensions.get("window");
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const ScrollZoomBar = ({ onZoomChange }) => {
  const [zoom, setZoom] = useState(0.5);
  const [sliderUsed, setSliderUsed] = useState(false);

  const debouncedZoomChange = useCallback(debounce(onZoomChange, 100), [
    onZoomChange,
  ]);

  const handleZoomChange = (value) => {
    setZoom(value);
    debouncedZoomChange(value);
    if (!sliderUsed) {
      setSliderUsed(true);
    }
  };

  return (
    <View style={styles.slidercontainer}>
      <Slider
        style={styles.slider}
        minimumValue={width > 800 ? 0.7 : 0.2}
        maximumValue={2}
        value={sliderUsed ? undefined : zoom}
        onValueChange={handleZoomChange}
        thumbTintColor="#000"
        minimumTrackTintColor="#000"
        maximumTrackTintColor="#000"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  slidercontainer: {
    position: "absolute",
    // right: -40,
    // top: width > 800 ? "40%" : "40%",
    // transform: [{ translateY: -100 }],
    // height: 300,
    // justifyContent: "center",
    bottom: width > 600 ? height * 0.05 : height * 0.08,
    left: width > 800 ? width * 0.05 : width * 0.07,
  },
  slider: {
    width: width > 600 ? 300 : 200,
    height: 100,
    // transform: [{ rotate: "-90deg" }],
    alignItems: "center",
  },
});

export default ScrollZoomBar;
