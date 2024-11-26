import React, { useState, useEffect } from "react";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "react-native";
import { useUser } from "../context/userContext";
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

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, loading } = useUser();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colorScheme.primary} />
      </View>
    );
  }

  return user?.esAdmin ? (
    <AdminTabs colorScheme={colorScheme} />
  ) : (
    <UserTabs colorScheme={colorScheme} />
  );
}
