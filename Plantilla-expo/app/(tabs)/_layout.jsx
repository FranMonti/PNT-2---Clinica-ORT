import React, { useState, useEffect } from "react";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AdminTabs = ({ colorScheme }) => (
  <Tabs
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
    }}
  >
    <Tabs.Screen
      name="index"
      options={{
        title: "Home",
        tabBarIcon: ({ color, focused }) => (
          <Ionicons
            size={28}
            name={focused ? "home" : "home-outline"}
            color={color}
          />
        ),
      }}
    />
    <Tabs.Screen
  name="mi_perfil"
  options={{
    title: "Mi Perfil",
    tabBarIcon: ({ color, focused }) => (
      <Ionicons
        size={28}
        name={focused ? "person" : "person-outline"}
        color={color}
      />
    ),
  }}
/>

    <Tabs.Screen
      name="nuevo_turno"
      options={{
        title: "Nuevo Turno",
        tabBarIcon: ({ color, focused }) => (
          <Ionicons
            size={28}
            name={focused ? "calendar" : "calendar-outline"}
            color={color}
          />
        ),
      }}
    />
    <Tabs.Screen
      name="maps"
      options={{
        title: "Mapa",
        tabBarIcon: ({ color, focused }) => (
          <Ionicons
            size={28}
            name={focused ? "map" : "map-outline"}
            color={color}
          />
        ),
      }}
    />
  </Tabs>
);

const UserTabs = ({ colorScheme }) => (
  <Tabs
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
    }}
  >
    <Tabs.Screen
      name="index"
      options={{
        title: "Home",
        tabBarIcon: ({ color, focused }) => (
          <Ionicons
            size={28}
            name={focused ? "home" : "home-outline"}
            color={color}
          />
        ),
      }}
    />
    <Tabs.Screen
  name="mi_perfil"
  options={{
    title: "Mi Perfil",
    tabBarIcon: ({ color, focused }) => (
      <Ionicons
        size={28}
        name={focused ? "person" : "person-outline"} // Cambiado a íconos de persona
        color={color}
      />
    ),
  }}
/>

    <Tabs.Screen
      name="nuevo_turno"
      options={{
        title: "Nuevo Turno",
        tabBarIcon: ({ color, focused }) => (
          <Ionicons
            size={28}
            name={focused ? "calendar" : "calendar-outline"}
            color={color}
          />
        ),
      }}
    />
    <Tabs.Screen
      name="maps"
      options={{
        title: "Mapa",
        tabBarIcon: ({ color, focused }) => (
          <Ionicons
            size={28}
            name={focused ? "map" : "map-outline"}
            color={color}
          />
        ),
      }}
    />
  </Tabs>
);

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const isAdmin = await verificarAdmin();
    };
  
    checkAdmin();
  }, []);

  const verificarAdmin = async () => {
    try {

      const userId = await AsyncStorage.getItem("userId");
  
      if (!userId) {
        console.error("ID de usuario no encontrado en AsyncStorage.");
        return false;
      }
      const response = await fetch("https://67310dbe7aaf2a9aff0fb8c5.mockapi.io/Datos-Usuario");
  
      if (!response.ok) {
        console.error("Error en la respuesta del servidor:", response.status);
        alert("Error al conectar con el servidor.");
        return false;
      }
  
      const data = await response.json();
  
      const user = data.find((u) => u.id === userId);
  
    } catch (error) {
      console.error("Error al verificar permisos de administrador:", error);
      return false;
    }
  };
  

  return isAdmin ? (
    <AdminTabs colorScheme={colorScheme} />
  ) : (
    <UserTabs colorScheme={colorScheme} />
  );
}
