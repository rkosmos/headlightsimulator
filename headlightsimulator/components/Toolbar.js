import React, { useState } from "react";
import Modal from "react-native-modal";
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Text,
  Dimensions,
  Platform,
} from "react-native";
import undoIcon from "../assets/icons/undoIcon.png";
import clearIcon from "../assets/icons/clearIcon.png";
import saveIcon from "../assets/icons/saveIcon.png";
import resetIcon from "../assets/icons/resetIcon.png";
import checkIcon from "../assets/icons/checkIcon.png";
import loadIcon from "../assets/icons/loadIcon.png";
import diagramIcon from "../assets/icons/diagramIcon.png";
const { width, height } = Dimensions.get("window");
const ToolbarWithModal = ({
  fileName,
  setFileName,
  lines,
  setLines,
  currentFile,
  setCurrentFile,
  navigation,
  saveProgressToFile,
  checkConnections,
  scale,
  translateX,
  translateY,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmInfoModalVisible, setConfirmInfoModalVisible] = useState(false);
  const handleUndo = () => setLines((prev) => prev.slice(0, -1));
  const handleClearAll = () => setLines([]);

  const handleSaveProgress = () => {
    if (!currentFile) {
      // No file loaded, show modal to enter file name
      setModalVisible(true);
    } else {
      // File loaded, show alert first
      Alert.alert(
        "Save Progress",
        "Do you want to save as a new file or overwrite current progress?",
        [
          {
            text: "Save as New",
            onPress: () => setModalVisible(true), // Show modal to enter a new file name
          },
          {
            text: "Overwrite",
            onPress: async () => {
              saveProgressToFile(
                lines,
                currentFile,
                setCurrentFile,
                fileName,
                true
              ); // Overwrite current file
            },
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  };
  const resetZoom = () => {
    scale.value = width > 800 ? 0.7 : 0.6;
    translateX.value = width > 800 ? -500 : -780;
    translateY.value = width > 800 ? -400 : -200;
  };

  // MODAL CONFIRMATION
  const handleLoadProgressPress = () => {
    setConfirmModalVisible(true);
  };
  const handleInfoModalPress = () => {
    setConfirmInfoModalVisible(true);
  };
  const handleContinueWithoutSaving = () => {
    setConfirmModalVisible(false);
    navigation.navigate("FileList");
  };

  const handleCancel = () => {
    setConfirmModalVisible(false);
    setConfirmInfoModalVisible(false);
  };
  const handleCheckConnections = () => {
    console.log("Checking connections...");
    if (lines.length === 0) {
      Alert.alert("No connections", "No connections made.");
      return;
    }

    const { status, yellowConnectionsCount, totalConnections } =
      checkConnections(lines); // Call checkConnections to get the results
    Alert.alert(
      "Connection Status",
      `${status}: ${yellowConnectionsCount} correct connections / ${totalConnections} total connections`
    );
  };
  return (
    <View style={styles.toolbarContainer}>
      <ScrollView horizontal contentContainerStyle={styles.scrollContainer}>
        <View style={styles.toolbarBtns}>
          <TouchableOpacity onPress={handleUndo} style={styles.iconContainer}>
            <Image source={undoIcon} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleClearAll}
            style={styles.iconContainer}
          >
            <Image source={clearIcon} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSaveProgress}
            style={styles.iconContainer}
          >
            <Image source={saveIcon} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={resetZoom} style={styles.iconContainer}>
            <Image source={resetIcon} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCheckConnections}
            style={styles.iconContainer}
          >
            <Image source={checkIcon} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleInfoModalPress}
            style={styles.iconContainer}
          >
            <Image source={diagramIcon} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLoadProgressPress}
            style={styles.iconContainer}
          >
            <Image source={loadIcon} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Save Progress Modal */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter file name"
            placeholderTextColor="gray"
            value={fileName}
            onChangeText={setFileName}
          />
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              onPress={() => {
                saveProgressToFile(
                  lines,
                  currentFile,
                  setCurrentFile,
                  fileName
                );
                setModalVisible(false);
              }}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirm Load Progress Modal */}
      <Modal
        isVisible={confirmModalVisible}
        onBackdropPress={() => setConfirmModalVisible(false)}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalConfirmText}>
            Already have saved your progress?
          </Text>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              onPress={handleContinueWithoutSaving}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCancel} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirm Info Modal */}
      <Modal
        isVisible={confirmInfoModalVisible}
        onBackdropPress={() => setConfirmInfoModalVisible(false)}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Image
            source={require("../assets/diagram.jpg")}
            style={{
              width: "100%",
              height: 240,
              // padding: 10,
              resizeMode: "contain",
              marginBottom: 20,
            }}
          />
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity onPress={handleCancel} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  scrollContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: width > 600 ? "stretch" : "space-between",
    paddingVertical: 10,
    flex: width > 600 ? 1 : 0,
    // width: "90%",
  },
  toolbarContainer: {
    position: "absolute",
    top: width > 600 ? height * 0.05 : height * 0.08,

    flexDirection: "row", // Ensure horizontal layout
    marginLeft: width * 0.05,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    width: "90%",
    // alignItems: "center",
    justifyContent: "center",
    // flex: 1,
  },
  toolbarBtns: {
    flexDirection: "row", // Ensure buttons are laid out horizontally
    justifyContent: "space-evenly",
    alignItems: "center",
    flex: 1,
    padding: 10,
  },
  icon: {
    // margin: 10,
    height: width > 600 ? 55 : 60,
    width: width > 600 ? 55 : 60,
    // marginBottom: 20,
    resizeMode: "contain",
    // flex:
  },
  modalContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    margin: 0,
    // position: "absolute",
  },
  modalContent: {
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    width: width * 0.8, // Adjusted width for better layout
  },
  textInput: {
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: "white",
    color: "black",
    padding: 10,
    width: "100%",
    fontFamily: "Alata-Regular",
    textAlign: "center",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    fontFamily: "Alata-Regular",
  },
  modalConfirmText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "Alata-Regular",
  },
});

export default ToolbarWithModal;
