import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Image,
  ActivityIndicator,
} from "react-native";
import * as FileSystem from "expo-file-system";
// import * as ScreenOrientation from "expo-screen-orientation";
const FileListScreen = ({ navigation }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const folderUri = FileSystem.documentDirectory + "SavedProgress/";

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const dirInfo = await FileSystem.getInfoAsync(folderUri);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(folderUri, {
            intermediates: true,
          });
        }

        const fileNames = await FileSystem.readDirectoryAsync(folderUri);
        const fileDetails = await Promise.all(
          fileNames.map(async (file) => {
            const fileUri = folderUri + file;
            const info = await FileSystem.getInfoAsync(fileUri);
            return {
              name: file.replace(".json", ""), // Remove .json extension
              uri: fileUri,
              modified: new Date(info.modificationTime * 1000), // Keep as Date object
            };
          })
        );

        // Sort files by modified date in descending order
        const sortedFiles = fileDetails.sort((a, b) => b.modified - a.modified);

        setFiles(sortedFiles);
      } catch (error) {
        console.error("Error loading files:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFiles();
  }, []);

  const handleFileSelect = (fileUri) => {
    navigation.navigate("ConnectTheDots", { fileUri });
  };

  const handleDelete = async (fileUri) => {
    Alert.alert("Delete File", "Are you sure you want to delete this file?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await FileSystem.deleteAsync(fileUri);
            setFiles(files.filter((file) => file.uri !== fileUri));
          } catch (error) {
            console.error("Error deleting file:", error);
          }
        },
        style: "destructive",
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../assets/bg.png")} // Replace with your actual image path
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Right: Info and Create Button */}
        <View style={styles.rightPanel}>
          <Text style={styles.headline}>YOUR CURRENT PROGRESS</Text>
          <Text style={styles.subtext}>
            Make sure to save your files to prevent losing progress.
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate("ConnectTheDots")}
          >
            <Text style={styles.createButtonText}>Create New File</Text>
          </TouchableOpacity>
        </View>
        {/* Left: File List Section */}
        <View style={styles.leftPanel}>
          <Text style={styles.sectionTitle}>Select a file to load:</Text>
          <FlatList
            data={files}
            keyExtractor={(item) => item.uri}
            renderItem={({ item }) => (
              <View style={styles.fileItem}>
                <TouchableOpacity
                  onPress={() => handleFileSelect(item.uri)}
                  style={styles.fileContent}
                >
                  <Text style={styles.fileName}>{item.name}</Text>
                  <Text style={styles.fileDate}>
                    Modified: {item.modified.toLocaleString()}
                  </Text>
                </TouchableOpacity>
                {/* Replace delete button text with an image */}
                <TouchableOpacity
                  onPress={() => handleDelete(item.uri)}
                  style={styles.deleteButton}
                >
                  <Image
                    source={require("../assets/icons/delete-icon.png")} // Replace with actual image path
                    style={styles.deleteIcon}
                  />
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.flatListContainer}
          />
        </View>
      </View>
    </ImageBackground>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
    position: "absolute",
  },
  container: {
    flex: 1,
    flexDirection: width > 600 ? "column" : "column",
    padding: 30,
    backgroundColor: "rgba(0,0,0,0.5)", // Semi-transparent overlay for better readability
  },
  leftPanel: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginRight: width > 600 ? 0 : 0,
    maxHeight: height, // Prevent overflow
  },
  sectionTitle: {
    fontSize: 15,
    // fontWeight: "bold",
    marginBottom: 10,
    color: "white",
    fontFamily: "Alata-Regular",
  },
  fileItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#515151",
    padding: 20,
    marginBottom: 8,
    borderRadius: 8,
    marginLeft: 0,
  },
  fileContent: {
    flex: 1,
  },
  fileName: {
    fontSize: 28,
    fontFamily: "fFinish-Regular",
    // fontWeight: "bold",
    width: "80%",
    color: "white",
  },
  fileDate: {
    fontSize: 12,
    color: "white",
    fontFamily: "Alata-Regular",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 5,
  },
  deleteIcon: {
    width: 24,
    height: 24, // Adjust size as needed
  },
  flatListContainer: {
    paddingBottom: 50, // Avoid the scroll over the button
  },
  rightPanel: {
    // flex: 1,
    justifyContent: "center",
    padding: 20,
    borderRadius: 10,
    paddingTop: "15%",
  },
  headline: {
    fontSize: width > 800 ? 50 : 40,
    fontFamily: "fFinish-Regular",
    // fontWeight: "bold",
    textAlign: "left",
    color: "orange",
  },
  subtext: {
    fontSize: width > 800 ? 20 : 16,
    fontFamily: "Alata-Regular",
    textAlign: "left",
    marginVertical: 10,
    color: "white",
    // width: "90%",
  },
  createButton: {
    backgroundColor: "#294B65",
    paddingVertical: width > 800 ? 20 : 12,
    paddingHorizontal: width > 800 ? 25 : 15,
    borderRadius: 8,
    marginTop: 10,
    width: "50%",
  },
  createButtonText: {
    fontFamily: "fFinish-Regular",
    color: "white",
    fontSize: 16,
    // fontWeight: "bold",
    textAlign: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

export default FileListScreen;
