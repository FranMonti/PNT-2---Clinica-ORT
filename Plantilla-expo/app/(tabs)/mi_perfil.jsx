import React, { useState, useCallback } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import { useUser } from '../context/userContext';
import { useRouter } from 'expo-router';
import RNRestart from 'react-native-restart';

export default function TabProfile() {
  const [turnos, setTurnos] = useState([]);
  const [showAllTurnos, setShowAllTurnos] = useState(false);
  const [proxTurno, setProxTurno] = useState(null);
  const navigation = useNavigation();
  const router = useRouter();
  const { user, clearUser } = useUser();
  const restartApp = () => {
    RNRestart.Restart(); 
  };

  useFocusEffect(
    useCallback(() => {
      const fetchTurnos = async () => {
        if (!user?.id) return;
        
        try {
          const turnosResponse = await fetch(
            `https://672982836d5fa4901b6d6322.mockapi.io/api/bd/Turno`
          );
          const turnosData = await turnosResponse.json();

          if (!Array.isArray(turnosData)) {
            return;
          }
          
          const filteredTurnos = turnosData.filter(
            (turno) => turno.pacienteId === user.id
          );

          if (filteredTurnos.length === 0) {
            return;
          }

          const today = new Date();
          const validTurnos = filteredTurnos.filter(
            (turno) => new Date(turno.fecha) >= today
          );

          if (validTurnos.length === 0) {
            return;
          }

          const sortedTurnos = validTurnos.sort(
            (a, b) => new Date(a.fecha) - new Date(b.fecha)
          );

          setTurnos(sortedTurnos);
          setProxTurno(sortedTurnos[0]);
        } catch (error) {
          console.error("Error fetching turnos:", error);
        }
      };

      fetchTurnos();

      return () => {
        setTurnos([]);
        setProxTurno(null);
      };
    }, [user?.id])
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
        setTurnos((prevTurnos) => prevTurnos.filter((turno) => turno.id !== turnoId));
        if (proxTurno && proxTurno.id === turnoId) {
          setProxTurno(turnos[1] || null);
        }
  
        Alert.alert(
          "Turno Cancelado",
          "El turno se canceló exitosamente.",
          [{ text: "Aceptar" }]
        );
      } else {
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
    console.log('entro a handle logout');
    await clearUser(); 
    console.log('router:', router.navigate);
    restartApp();
  };

  if (!user) {
    return null;
  }

  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Mi Perfil</Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileBox}>
            <Text style={styles.title}>Mis Datos</Text>
            <Text style={styles.profileText}>Nombre: {user.usuario}</Text>
            <Text style={styles.profileText}>Email: {user.email}</Text>
          </View>

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
        turnos.length > 0 && (
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
    justifyContent: "space-between",
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
    backgroundColor: "#e53935",
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