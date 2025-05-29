import React from "react";
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const Joystick = ({ onMove }) => {
  const { width, height } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const JOYSTICK_RADIUS = width * 0.1;
  const KNOB_RADIUS = width * 0.05;
  const SPEED_FACTOR = width / 400; // Adjust this factor to speed up the joystick movement

  const handleGesture = (event) => {
    const { translationX: rawTranslationX, translationY: rawTranslationY } =
      event.nativeEvent;

    const scaledTranslationX = rawTranslationX * SPEED_FACTOR;
    const scaledTranslationY = rawTranslationY * SPEED_FACTOR;

    const distance = Math.sqrt(
      scaledTranslationX ** 2 + scaledTranslationY ** 2
    );
    if (distance <= JOYSTICK_RADIUS - KNOB_RADIUS) {
      translateX.value = scaledTranslationX;
      translateY.value = scaledTranslationY;
    } else {
      const angle = Math.atan2(scaledTranslationY, scaledTranslationX);
      translateX.value = (JOYSTICK_RADIUS - KNOB_RADIUS) * Math.cos(angle);
      translateY.value = (JOYSTICK_RADIUS - KNOB_RADIUS) * Math.sin(angle);
    }

    // Invert movement
    onMove(-translateX.value, -translateY.value);
  };

  const handleGestureEnd = () => {
    translateX.value = withSpring(0, { stiffness: 200, damping: 20 });
    translateY.value = withSpring(0, { stiffness: 200, damping: 20 });
    // onMove(0, 0);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <View
      style={[
        styles.joystickContainer,
        {
          bottom: height * 0.05,
          right: width > 800 ? width * 0.05 : width * 0.07,
        },
      ]}
    >
      <View
        style={[
          styles.joystickBackground,
          {
            width: JOYSTICK_RADIUS * 2,
            height: JOYSTICK_RADIUS * 2,
            borderRadius: JOYSTICK_RADIUS,
          },
        ]}
      >
        <PanGestureHandler
          onGestureEvent={handleGesture}
          onHandlerStateChange={(event) => {
            if (event.nativeEvent.state === State.END) {
              handleGestureEnd();
            }
          }}
        >
          <Animated.View
            style={[
              styles.joystickKnob,
              animatedStyle,
              {
                width: KNOB_RADIUS * 2,
                height: KNOB_RADIUS * 2,
                borderRadius: KNOB_RADIUS,
              },
            ]}
          >
            <Image
              style={[
                styles.joystickIcon,
                { width: KNOB_RADIUS * 2, height: KNOB_RADIUS * 2 },
              ]}
            />
          </Animated.View>
        </PanGestureHandler>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  joystickContainer: {
    position: "absolute",
    // bottom: 50,
    // right: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  joystickBackground: {
    // width: 100,
    // height: 100,
    borderRadius: 100,
    backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  joystickKnob: {
    // width: 40,
    // height: 40,
    borderRadius: 35,
    backgroundColor: "#666",
    position: "absolute",
  },
  joystickIcon: {
    // width: 70,
    // height: 70,
    resizeMode: "contain",
  },
});

export default Joystick;
