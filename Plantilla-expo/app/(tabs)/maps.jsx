import { View, Text, ScrollView, Image, StyleSheet, FlatList, Dimensions } from "react-native";
import MapView from "react-native-maps";

export default function MapTabScreen() {
  return (
    <View style={styles.container}>
      <MapView style={styles.map} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
