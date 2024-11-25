import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Alert
} from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function TabProfile() {
  const [userData, setUserData] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [showAllTurnos, setShowAllTurnos] = useState(false);
  const [proxTurno, setProxTurno] = useState(null);
  const navigation = useNavigation(); 

  
useFocusEffect(
  useCallback(() => {
    const fetchData = async () => {
      try {
        // Obtén el ID del almacenamiento local
        const storedId = await AsyncStorage.getItem("userId");
        if (!storedId) {
          console.error("No se encontró un ID en el almacenamiento");
          return;
        }

        // Fetch para obtener los datos del usuario usando el ID
        const userResponse = await fetch(
          `https://67310dbe7aaf2a9aff0fb8c5.mockapi.io/Datos-Usuario/${storedId}`
        );
        const userData = await userResponse.json();

        if (!userData) {
          console.error("No se encontró información del usuario");
          return;
        }

        delete userData.admin; // Eliminamos el dato admin
        setUserData(userData);

        // Fetch para obtener los turnos asociados al usuario
        const turnosResponse = await fetch(
          `https://672982836d5fa4901b6d6322.mockapi.io/api/bd/Turno`
        );
        const turnosData = await turnosResponse.json();

        if (!Array.isArray(turnosData)) {
          console.error("Los datos de los turnos no son un array válido");
          return;
        }
        const filteredTurnos = turnosData.filter(
          (turno) => turno.pacienteId === storedId
        );

        if (filteredTurnos.length === 0) {
          console.log("No hay turnos para este paciente");
          return;
        }

        // Filtrar turnos con fecha posterior o igual a la fecha actual
        const today = new Date();
        const validTurnos = filteredTurnos.filter(
          (turno) => new Date(turno.fecha) >= today
        );

        if (validTurnos.length === 0) {
          console.log("No hay turnos futuros para este paciente");
          return;
        }

        // Ordenamos los turnos válidos por fecha (más cercano a más lejano)
        const sortedTurnos = validTurnos.sort(
          (a, b) => new Date(a.fecha) - new Date(b.fecha)
        );

        setTurnos(sortedTurnos);

        // Asignamos el turno más cercano
        setProxTurno(sortedTurnos[0]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    // Limpieza opcional si es necesario
    return () => {
      setTurnos([]);
      setProxTurno(null);
      setUserData(null);
    };
  }, [])
);
  

  const handleDeleteTurno = async (turnoId) => {
    try {
      const response = await fetch(
        `https://672982836d5fa4901b6d6322.mockapi.io/api/bd/Turno/${turnoId}`,
        {
          method: "DELETE",
        }
      );
  
      if (response.ok) {
        console.log(`Turno con ID ${turnoId} eliminado`);
        // Actualiza la lista de turnos después de eliminar
        setTurnos((prevTurnos) => prevTurnos.filter((turno) => turno.id !== turnoId));
        // Actualiza proxTurno si el turno eliminado era el próximo
        if (proxTurno && proxTurno.id === turnoId) {
          setProxTurno(turnos[1] || null); // Ajusta al siguiente turno más cercano
        }
  
        // Mostrar alerta de éxito
        Alert.alert(
          "Turno Cancelado",
          "El turno se canceló exitosamente.",
          [{ text: "Aceptar" }]
        );
      } else {
        console.error(`Error al eliminar el turno con ID ${turnoId}`);
        Alert.alert(
          "Error",
          "No se pudo cancelar el turno. Por favor, inténtalo de nuevo.",
          [{ text: "Aceptar" }]
        );
      }
    } catch (error) {
      console.error("Error al realizar el DELETE:", error);
      Alert.alert(
        "Error",
        "Ocurrió un error al intentar cancelar el turno.",
        [{ text: "Aceptar" }]
      );
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userId");
    router.replace("/index"); // Redirigir al login
  };


  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.container}>
          {/* Encabezado con flecha de regreso */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Mi Perfil</Text>
            <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
          </View>
  
          {/* Información del usuario */}
          {userData && (
            <View style={styles.profileBox}>
              <Text style={styles.title}>Mis Datos</Text>
              <Text style={styles.profileText}>Nombre: {userData.usuario}</Text>
              <Text style={styles.profileText}>Email: {userData.email}</Text>
            </View>
          )}
  
          <Text style={styles.title}>Mis Turnos</Text>
          {!proxTurno && (
            <View style={styles.noTurnosContainer}>
              <Text style={styles.noTurnosText}>No tiene turnos disponibles</Text>
              <TouchableOpacity
                style={styles.newTurnButton}
                onPress={() => navigation.navigate("nuevo_turno")}
              >
                <Text style={styles.newTurnButtonText}>Nuevo Turno</Text>
              </TouchableOpacity>
            </View>
          )}
          {!showAllTurnos && proxTurno && (
            <View style={styles.turnoBox}>
              <Text style={styles.profileText}>Próximo Turno:</Text>
              <Text style={styles.profileText}>Fecha: {proxTurno.fecha}</Text>
              <Text style={styles.profileText}>Hora: {proxTurno.hora}</Text>
              <Text style={styles.profileText}>
                Especialidad: {proxTurno.especialidad}
              </Text>
              <Text style={styles.profileText}>
                Doctor: {proxTurno.doctor}
              </Text>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleDeleteTurno(proxTurno.id)}
              >
                <Text style={styles.cancelButtonText}>Cancelar Turno</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      }
      data={showAllTurnos ? turnos : []}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.turnoContainer}>
          <View style={styles.turnoBox}>
            <Text style={styles.profileText}>Fecha: {item.fecha}</Text>
            <Text style={styles.profileText}>Hora: {item.hora}</Text>
            <Text style={styles.profileText}>Especialidad: {item.especialidad}</Text>
            <Text style={styles.profileText}>Doctor: {item.doctor}</Text>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleDeleteTurno(item.id)}
            >
              <Text style={styles.cancelButtonText}>Cancelar Turno</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListFooterComponent={
        turnos.length > 0 && ( // Solo muestra el botón si hay turnos
          <View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setShowAllTurnos(!showAllTurnos)}
            >
              <Text style={styles.buttonText}>
                {showAllTurnos
                  ? "Ocultar Todos Mis Turnos"
                  : "Ver Todos Mis Turnos"}
              </Text>
            </TouchableOpacity>
          </View>
        )
      }
      nestedScrollEnabled
    />
  );
}  
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between", // Espacio entre el título y el botón
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f9f9f9",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#424242",
  },
  profileBox: {
    backgroundColor: "#e3f2fd",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  turnoBox: {
    backgroundColor: "#e3f2fd",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1565c0",
    marginBottom: 10,
  },
  profileText: {
    fontSize: 18,
    marginBottom: 5,
    color: "#424242",
  },
  button: {
    padding: 10,
    backgroundColor: "#1e88e5",
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  turnoContainer: {
    marginHorizontal: 20,
  },
  cancelButton: {
    backgroundColor: "#e53935", // Rojo para indicar acción destructiva
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },  
  noTurnosContainer: {
    backgroundColor: "#e3f2fd",
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  noTurnosText: {
    fontSize: 18,
    color: "#1565c0",
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  newTurnButton: {
    backgroundColor: "#4caf50",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
  },
  newTurnButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
   logoutButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});
