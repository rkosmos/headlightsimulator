import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Button,
  ImageBackground,
  Dimensions,
  Alert,
  FlatList,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { withTiming, withSpring } from "react-native-reanimated";
import {
  PanGestureHandler,
  PinchGestureHandler,
  GestureHandlerRootView,
  State,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import Modal from "react-native-modal";
import Joystick from "../components/Joystick";
import ToolbarWithModal from "../components/Toolbar";

import bgImage from "../assets/background_upscaled7.png";
import bgImage1 from "../assets/scale.png";
import newBgImage from "../assets/background_upscaled8.png"; // Import the new background image
import ScrollZoomBar from "../components/ScrollZoomBar";

const directoryUri =
  Platform.OS === "ios"
    ? FileSystem.documentDirectory + "SavedProgress/"
    : FileSystem.documentDirectory + "SavedProgress/";

// Now proceed with checking or creating the directory

const { width, height } = Dimensions.get("window");
// // console.log(width, height);
// const imageWidth = width * 1.2; // 20% bigger
// const imageHeight = height * 1.2; // 20% bigger
const width1 = 975.2380952380952 * 1.2;
const height1 = 561.5238095238095 * 1.2;

const validYellowConnections = new Set([
  "25-12", //1
  "12-25",
  "12-15", //2
  "15-12",
  "11-16", //3
  "16-11",
  "11-2", //4
  "2-11",
  "1-19", //5
  "19-1",
  "26-25", //6
  "25-26",
  "5-13", //7
  "13-5",
  "4-9", //8
  "9-4",
  "10-17", //9
  "17-10",
  "7-18", //10
  "18-7",
  "9-22", //11
  "22-9",
  "6-19", //12
  "19-6",
  "14-17", //13
  "17-14",
  "19-21", //14
  "21-19",
  "23-24", //15
  "24-23",
  "16-18", //16
  "18-16",

  "20-22", //17
  "22-20",
  "13-14", //18
  "14-13",
]);

// const validYellowConnections = new Set(["1-6", "6-1"]);

const checkConnections = (lines) => {
  // Count how many "color": "yellow" lines exist
  const yellowConnectionsCount = lines.filter(
    (line) => line.color === "green"
  ).length;

  const hadRedLines = lines.some((line) => line.color === "red");
  // Count the number of valid pairs (divide by 2 to avoid double-counting)
  const totalConnections = 18;

  // Status is "PASSED" if the number of yellow connections matches the valid ones
  const status =
    yellowConnectionsCount === totalConnections ? "PASSED" : "FAILED";

  return {
    status,
    yellowConnectionsCount,
    totalConnections,
    hadRedLines,
  };
};

const saveProgressToFile = async (
  lines,
  currentFile,
  setCurrentFile,
  customFileName,
  overwrite = false
) => {
  try {
    const folderUri = FileSystem.documentDirectory + "SavedProgress/";
    await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true });

    let fileUri = currentFile; // Default to current file for overwriting
    const fileName = customFileName?.trim() || "";

    // If not overwriting, we check file name validity and create a new file
    if (!overwrite) {
      if (!fileName) {
        Alert.alert("Error", "Please enter a valid file name");
        return;
      }
      fileUri = folderUri + `${fileName}.json`;
      const fileExists = await FileSystem.getInfoAsync(fileUri);
      if (fileExists.exists) {
        Alert.alert("Error", "File already exists, choose another name");
        return;
      }
    }

    // Write to the file (overwrite if necessary)
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(lines), {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Update the current file reference
    setCurrentFile(fileUri);
    console.log("File saved at:", fileUri);
  } catch (error) {
    console.error("Error saving progress:", error);
  }
};

const ConnectDotsWithSwipe = () => {
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState("");
  const [startId, setStartId] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fileName, setFileName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(bgImage); // State for background image

  const scale = width > 800 ? useSharedValue(0.8) : useSharedValue(0.6);
  // const translateX = useSharedValue(-500);
  // const translateY = useSharedValue(-600);
  const translateX = width > 800 ? useSharedValue(-4000) : useSharedValue(-780);
  const translateY = width > 800 ? useSharedValue(-400) : useSharedValue(-200);
  const route = useRoute();
  const navigation = useNavigation();

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);
  const handleZoomChange = (value) => {
    scale.value = withTiming(value, { duration: 200 });
  };

  useEffect(() => {
    if (route.params?.fileUri) {
      loadProgress(route.params.fileUri);
    }
  }, [route.params?.fileUri]);

  const loadProgress = async (fileUri) => {
    try {
      const folderUri = FileSystem.documentDirectory + "SavedProgress/";

      // Check if the directory exists and create it if not
      const dirInfo = await FileSystem.getInfoAsync(folderUri);
      if (!dirInfo.exists) {
        console.log("Directory doesn't exist, creating now...");
        await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true });
        console.log("Directory created:", folderUri);
      } else {
        console.log("Directory already exists:", folderUri);
      }

      // Proceed with loading the file
      const content = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const parsedLines = JSON.parse(content);
      setLines(parsedLines);
      setCurrentFile(fileUri);
      console.log("File loaded successfully from:", fileUri);
    } catch (error) {
      console.error("Error loading progress:", error);
      Alert.alert("Error", `Failed to load the file: ${error.message}`);
    }
  };

  const tabletPoints = {
    // width if -, to the left from center, if + to the right from center
    // height if -, to up from center, if + to down from center
    point1: { id: 1, x: width1 - 555, y: height1 - 12 },
    point2: { id: 2, x: width1 - 488, y: height1 - 110 },
    point3: { id: 3, x: width1 - 420, y: height1 - 12 },
    point4: { id: 4, x: width1 - 488, y: height1 + 60 },
    point5: { id: 5, x: width1 - 488, y: height1 - 18 },
    point6: { id: 6, x: width1 - 230, y: height1 - 12 },
    point7: { id: 7, x: width1 - 160, y: height1 - 110 },
    point8: { id: 8, x: width1 - 95, y: height1 - 12 },
    point9: { id: 9, x: width1 - 160, y: height1 + 60 },
    point10: { id: 10, x: width1 - 160, y: height1 - 16 },
    point11: { id: 11, x: width1 + 18, y: height1 - 288 },
    point12: { id: 12, x: width1 + 108, y: height1 - 350 },
    point13: { id: 13, x: width1 + 200, y: height1 - 288 },
    point14: { id: 14, x: width1 + 555, y: height1 - 288 },
    point15: { id: 15, x: width1 + 650, y: height1 - 350 },
    point16: { id: 16, x: width1 + 740, y: height1 - 288 },
    point17: { id: 17, x: width1 + 640, y: height1 - 90 },
    point18: { id: 18, x: width1 + 665, y: height1 - 80 },
    point19: { id: 19, x: width1 + 620, y: height1 + 155 },
    point20: { id: 20, x: width1 + 612, y: height1 + 185 },
    point21: { id: 21, x: width1 + 515, y: height1 + 210 },
    point22: { id: 22, x: width1 + 310, y: height1 + 300 },
    point23: { id: 23, x: width1 + 285, y: height1 + 330 },
    point24: { id: 24, x: width1 - 160, y: height1 + 250 },
    point25: { id: 25, x: width1 - 213, y: height1 + 260 },
    point26: { id: 26, x: width1 - 338, y: height1 + 310 },
  };

  // Use the appropriate points based on the device type
  const points = tabletPoints;

  const parsePath = (path) => {
    const commands = path.match(/[ML][^ML]*/g);
    return commands.map((command) => {
      const [x, y] = command.slice(1).split(" ").map(Number);
      return { x, y };
    });
  };

  const doLinesIntersect = (line1, line2) => {
    const segments1 = parsePath(line1.path);
    const segments2 = parsePath(line2.path);

    const ccw = (A, B, C) =>
      (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);

    const checkIntersection = (A, B, C, D) => {
      return ccw(A, C, D) !== ccw(B, C, D) && ccw(A, B, C) !== ccw(A, B, D);
    };

    const isNearTabletPoint = (point) => {
      const radius = 10; // Define the radius within which intersections are ignored
      return Object.values(points).some(
        (tabletPoint) =>
          Math.hypot(tabletPoint.x - point.x, tabletPoint.y - point.y) <= radius
      );
    };

    for (let i = 0; i < segments1.length - 1; i++) {
      for (let j = 0; j < segments2.length - 1; j++) {
        if (
          checkIntersection(
            segments1[i],
            segments1[i + 1],
            segments2[j],
            segments2[j + 1]
          )
        ) {
          // Check if the intersection is near any tablet point
          if (
            isNearTabletPoint(segments1[i]) ||
            isNearTabletPoint(segments1[i + 1]) ||
            isNearTabletPoint(segments2[j]) ||
            isNearTabletPoint(segments2[j + 1])
          ) {
            continue; // Skip this intersection
          }
          // Alert.alert("Line intersects with another line");
          return true; // Intersection detected
        }
      }
    }

    return false;
  };

  const handleGestureEvent = (event) => {
    const { x, y } = event.nativeEvent;
    if (currentLine) {
      setCurrentLine(`${currentLine} L${x} ${y}`);
    }
  };

  const handleGestureStateChange = (event) => {
    const { x, y, state } = event.nativeEvent;

    if (state === State.BEGAN) {
      // Check if the user pressed a tabletPoint
      const startPoint = Object.values(points).reduce((closest, point) => {
        const distance = Math.hypot(point.x - x, point.y - y);
        return distance < 40 && distance < (closest?.distance || Infinity)
          ? { ...point, distance }
          : closest;
      }, null);

      if (startPoint) {
        // Start a new line from the tabletPoint
        setStartId(startPoint.id);
        setCurrentLine(`M${startPoint.x} ${startPoint.y}`);
        return;
      }
    }

    if (state === State.END) {
      if (currentLine) {
        // Check if the user pressed another tabletPoint
        const endPoint = Object.values(points).reduce((closest, point) => {
          const distance = Math.hypot(point.x - x, point.y - y);
          return distance < 40 && distance < (closest?.distance || Infinity)
            ? { ...point, distance }
            : closest;
        }, null);

        if (endPoint) {
          // Finalize the line if another tabletPoint is pressed
          const connectionKey = [startId, endPoint.id].sort().join("-");
          const newLine = {
            path: `${currentLine} L${endPoint.x} ${endPoint.y}`,
            color: validYellowConnections.has(connectionKey) ? "green" : "red",
            connectionKey,
          };

          // Check for intersections with existing lines
          const intersects = lines.some((line) =>
            doLinesIntersect(line, newLine)
          );
          if (intersects) {
            Alert.alert(
              "Error",
              "The new line intersects with an existing line."
            );
            return; // Do not add the line if it intersects
          }

          setLines((prev) => [...prev, newLine]);
          setCurrentLine(""); // Reset the current line
          setStartId(null); // Reset the start point
        } else {
          // Extend the line to the clicked point
          setCurrentLine((prev) => `${prev} L${x} ${y}`);
        }
      }
    }
  };

  const handleUndo = () => setLines((prev) => prev.slice(0, -1));
  const handleClearAll = () => setLines([]);

  const handleJoystickMove = (dx, dy) => {
    const speedFactor = 2; // Lower values = slower movement
    const duration = 50; // Adjust for smoother movement

    translateX.value = withSpring(translateX.value + dx * speedFactor, {
      damping: 10,
      stiffness: 80,
    });
    translateY.value = withSpring(translateY.value + dy * speedFactor, {
      damping: 10,
      stiffness: 80,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));
  useEffect(() => {
    const { status, yellowConnectionsCount, totalConnections, hadRedLines } =
      checkConnections(lines);

    if (yellowConnectionsCount === totalConnections && !hadRedLines) {
      setBackgroundImage(newBgImage); // Change background only if all connections are yellow and no red lines exist
    } else {
      setBackgroundImage(bgImage); // Revert if conditions aren't met
    }
  }, [lines]);

  return (
    <View style={{ flex: 1 }}>
      <GestureHandlerRootView style={styles.container}>
        <Image source={bgImage1} style={styles.repeatingBackground} />
        <Animated.View style={[styles.animatedContainer, animatedStyle]}>
          <PanGestureHandler
            onGestureEvent={handleGestureEvent}
            onHandlerStateChange={handleGestureStateChange}
          >
            <Svg
              width={width1 * 2}
              height={height1 * 2}
              viewBox={`0 0 ${width1 * 2} ${height1 * 2}`}
            >
              {lines.map((line, index) => (
                <Path
                  key={index}
                  d={line.path}
                  stroke={line.color}
                  strokeWidth="3"
                  fill="transparent"
                />
              ))}
              {currentLine && (
                <Path
                  d={currentLine}
                  stroke="red"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  fill="transparent"
                />
              )}
              {Object.values(points).map((point) => (
                <Circle
                  key={point.id}
                  cx={point.x}
                  cy={point.y}
                  r={width > 600 ? "12" : "12"}
                  fill="black"
                  stroke="white"
                  strokeWidth="2"
                />
              ))}
            </Svg>
          </PanGestureHandler>
          <ImageBackground
            source={backgroundImage}
            style={styles.backgroundImage}
            resizeMode="contain"
          ></ImageBackground>
        </Animated.View>

        <View style={styles.statusContainer}>
          <Text>{statusMessage}</Text>
        </View>

        <Joystick onMove={handleJoystickMove} />
        {/* Toolbar at the bottom */}
        <ToolbarWithModal
          fileName={fileName}
          setFileName={setFileName}
          lines={lines}
          setLines={setLines}
          navigation={navigation}
          currentFile={currentFile}
          setCurrentFile={setCurrentFile}
          navigation={navigation}
          saveProgressToFile={saveProgressToFile}
          checkConnections={checkConnections}
          translateX={translateX}
          translateY={translateY}
          scale={scale}
        />
        <ScrollZoomBar onZoomChange={handleZoomChange} />
        {/* </Image> */}
      </GestureHandlerRootView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "visible",
  },
  animatedContainer: {
    flex: 1,
    overflow: "visible",
  },
  backgroundImage: {
    // width: imageWidth,
    // height: imageHeight,
    width: width1 * 1.5,
    height: height1 * 1.5,
    alignSelf: "center",

    position: "absolute",
    top: 200,
    left: 400,
    zIndex: -1,
  },
  repeatingBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1, // Push it behind everything
    width: "100%",
    height: "100%",
  },
  statusContainer: {
    // padding: 20,
  },
});

export default ConnectDotsWithSwipe;
