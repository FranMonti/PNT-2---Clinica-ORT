import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import * as Linking from "expo-linking";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

export default function MapTabScreen() {
  const [location, setLocation] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(true);
  const mapRef = useRef(null);
  const clinicRefs = useRef({});

  // Lista de especialidades para asignarlas aleatoriamente a cada clínica ficticia
  const specialties = [
    "Ginecología",
    "Cardiología",
    "Dermatología",
    "Pediatría",
  ];

  // Puntos ficticios de clínicas en Capital Federal y Provincia de Buenos Aires
  const clinicLocations = [
    { id: 1, latitude: -34.6037, longitude: -58.3816, title: "Clínica Centro" },
    { id: 2, latitude: -34.6158, longitude: -58.4333, title: "Clínica Palermo" },
    { id: 3, latitude: -34.7052, longitude: -58.2787, title: "Clínica Lanús" },
    { id: 4, latitude: -34.6083, longitude: -58.37, title: "Clínica Monserrat" },
    { id: 5, latitude: -34.6437, longitude: -58.5659, title: "Clínica Lomas de Zamora" },
    { id: 6, latitude: -34.5514, longitude: -58.4647, title: "Clínica San Fernando" },
    { id: 7, latitude: -34.5636, longitude: -58.4587, title: "Clínica Vicente López" },
    { id: 8, latitude: -34.6023, longitude: -58.4207, title: "Clínica Belgrano" },
    { id: 9, latitude: -34.4713, longitude: -58.5097, title: "Clínica Tigre" },
    { id: 10, latitude: -34.617, longitude: -58.3687, title: "Clínica Recoleta" },
    { id: 11, latitude: -34.6404, longitude: -58.5625, title: "Clínica Banfield" },
    { id: 12, latitude: -34.6145, longitude: -58.4464, title: "Clínica Villa Urquiza" },
    { id: 13, latitude: -34.6654, longitude: -58.3669, title: "Clínica Almagro" },
    { id: 14, latitude: -34.6947, longitude: -58.3733, title: "Clínica Avellaneda" },
    { id: 15, latitude: -34.7217, longitude: -58.2548, title: "Clínica Quilmes" },
    { id: 16, latitude: -34.6179, longitude: -58.4291, title: "Clínica Caballito" },
    { id: 17, latitude: -34.6076, longitude: -58.3833, title: "Clínica San Telmo" },
    { id: 18, latitude: -34.5955, longitude: -58.4447, title: "Clínica Colegiales" },
    { id: 19, latitude: -34.6581, longitude: -58.4669, title: "Clínica Villa Lugano" },
    { id: 20, latitude: -34.6687, longitude: -58.5619, title: "Clínica Villa Fiorito" },
  ].map((clinic, index) => ({
    ...clinic,
    specialty: specialties[index % specialties.length],
    hours: "9:00hs a 18:00hs de Lunes a Viernes",
  }));
  
  async function postClinicLocations() {
    try {
      for (const clinic of clinicLocations) {
        const response = await fetch('https://672982836d5fa4901b6d6322.mockapi.io/api/bd/clinicas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(clinic),
        });
        const data = await response.json();
        console.log(`Clinic ${clinic.title} added:`, data);
      }
    } catch (error) {
      console.error('Error posting clinic locations:', error);
    }
  }
  
  useEffect(() => {
    postClinicLocations();
  }, []); 
  
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
    })();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setIsModalVisible(true);
    }, [])
  );

  const centerMap = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000
      );
    }
  };

  const navigateToClinic = (clinic) => {
    if (location) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${clinic.latitude},${clinic.longitude}&travelmode=driving`;
      Linking.openURL(url);
    }
  };

  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [filteredClinics, setFilteredClinics] = useState(clinicLocations); // Inicialmente todas las clínicas

  return (
    <View style={styles.container}>
      {/* Modal para mostrar mensaje inicial */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              ENCUENTRE SU CLÍNICA MÁS CERCANA
            </Text>

            {/* Selector de especialidad */}
            <Picker
              selectedValue={selectedSpecialty}
              onValueChange={(itemValue) => setSelectedSpecialty(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione una especialidad" value="" />
              <Picker.Item label="Ginecología" value="Ginecología" />
              <Picker.Item label="Cardiología" value="Cardiología" />
              <Picker.Item label="Dermatología" value="Dermatología" />
              <Picker.Item label="Pediatría" value="Pediatría" />
            </Picker>

            <View style={styles.modalButtonContainer}>
              {/* Botón para cerrar el modal */}
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cerrar</Text>
              </TouchableOpacity>

              {/* Botón para buscar con la especialidad seleccionada */}
              <TouchableOpacity
                style={styles.modalSearchButton}
                onPress={() => {
                  setFilteredClinics(
                    clinicLocations.filter(
                      (clinic) =>
                        selectedSpecialty === "" ||
                        clinic.specialty === selectedSpecialty
                    )
                  );
                  setIsModalVisible(false); // Cierra el modal después de aplicar el filtro
                }}
              >
                <Text style={styles.modalButtonText}>Buscar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={
            location
              ? {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }
              : undefined
          }
          showsUserLocation={true}
        >
          {location && (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Mi ubicación"
            />
          )}

          {filteredClinics.map((clinic) => (
            <Marker
              key={clinic.id}
              coordinate={{
                latitude: clinic.latitude,
                longitude: clinic.longitude,
              }}
              title={clinic.title}
              ref={(ref) => (clinicRefs.current[clinic.id] = ref)}
            >
              <Ionicons name="medical" size={28} color="red" />
              <Callout tooltip>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{clinic.title}</Text>
                  <Text>Especialidad: {clinic.specialty}</Text>
                  <Text>Horario: {clinic.hours}</Text>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() =>
                        clinicRefs.current[clinic.id]?.hideCallout()
                      }
                    >
                      <Text style={styles.buttonText}>Cerrar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.navigateButton}
                      onPress={() => navigateToClinic(clinic)}
                    >
                      <Text style={styles.buttonText}>Ir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>

        <TouchableOpacity style={styles.centerButton} onPress={centerMap}>
          <Ionicons name="locate" size={24} color="white" />
        </TouchableOpacity>

        {/* Botón para abrir el filtro */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setIsModalVisible(true)} // Abre el modal al presionar "Filtrar"
        >
          <Text style={styles.filterButtonText}>Filtrar</Text>
        </TouchableOpacity>
      </View>
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
  centerButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007bff",
    borderRadius: 30,
    padding: 10,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semi-transparente
  },
  modalContent: {
    width: 250, // Reduce el ancho del modal
    padding: 15, // Reduce el padding para hacerlo más compacto
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15, // Ajusta el margen inferior para alineación
    textAlign: "center",
  },
  modalCloseButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  callout: {
    width: 200,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
    marginRight: 5,
  },
  navigateButton: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalCloseButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginRight: 5,
  },
  modalSearchButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  centerButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007bff",
    borderRadius: 50,
    elevation: 5,
    width: 55,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
  },

  filterButton: {
    position: "absolute",
    bottom: 30,
    right: 80,
    backgroundColor: "#28a745",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 15,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  picker: {
    width: "100%",
    height: 200, // Ajusta la altura para que no sea demasiado grande
    marginBottom: 15,
  },
});
