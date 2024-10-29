import React from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Asegúrate de que esta librería esté instalada

export default function NuevoTurno() {
  // Datos de especialidades con imágenes
  const specialties = [
    { id: '1', specialty: 'Ginecología',image: require('../(tabs)/especialidad_imagenes/ginecologia.png') },
    { id: '2', specialty: 'Cardiología', image: require('../(tabs)/especialidad_imagenes/cardiologia.png') },
    { id: '3', specialty: 'Dermatología',image: require('../(tabs)/especialidad_imagenes/dermatologia.png') },
    { id: '4', specialty: 'Pediatría',image: require('../(tabs)/especialidad_imagenes/pediatria.png') },
  ];

  return (
    <View style={styles.container}>
      {/* Header con flecha y título */}
      <View style={styles.header}>
        <Icon name="chevron-back-outline" size={24} color="#000" />
        <Text style={styles.title}>Nuevo Turno</Text>
      </View>

      {/* Campo de búsqueda */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar especialidad"
        placeholderTextColor="#888"
      />

      {/* Lista de especialidades */}
      <FlatList
        data={specialties}
        keyExtractor={(item) => item.id}
        numColumns={2} // Mostrar dos columnas
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Imagen de la especialidad */}
            <Image source={item.image} style={styles.imagePlaceholder} />
            {/* Nombre de la especialidad */}
            <Text style={styles.specialtyText}>{item.specialty}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fff', // Color de fondo ajustado
    padding: 10, // Añadir algo de padding
    borderRadius: 8,
    elevation: 2, // Efecto de sombra opcional en Android
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10, // Espacio entre el icono y el título
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#b3e5fc',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    width: '45%', // Para ocupar la mitad de la pantalla en dos columnas
    aspectRatio: 1, // Hace que sea cuadrado
  },
  imagePlaceholder: {
    width: '80%',
    height: '80%', // Ajusta la altura según sea necesario
    borderRadius: 5,
    marginBottom: 10,
  },
  specialtyText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
