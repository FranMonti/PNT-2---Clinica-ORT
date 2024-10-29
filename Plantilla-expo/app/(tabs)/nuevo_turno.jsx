import React, { useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Icono from 'react-native-vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars'; 

const datosDoctores = {
  'Ginecología': [
    { id: '1', nombre: 'Dr. Ana López', distancia: '0.3 km' },
    { id: '2', nombre: 'Dr. Carlos Martínez', distancia: '0.7 km' },
    { id: '3', nombre: 'Dra. Sofia Ramírez', distancia: '1.1 km' },
  ],
  'Cardiología': [
    { id: '1', nombre: 'Dr. Javier Gómez', distancia: '0.4 km' },
    { id: '2', nombre: 'Dra. Lucia Fernández', distancia: '1.2 km' },
    { id: '3', nombre: 'Dr. Roberto Torres', distancia: '2.0 km' },
  ],
  'Dermatología': [
    { id: '1', nombre: 'Dr. Hugo Sánchez', distancia: '0.5 km' },
    { id: '2', nombre: 'Dra. Paula Díaz', distancia: '1.5 km' },
  ],
  'Pediatría': [
    { id: '1', nombre: 'Dra. Elena Castro', distancia: '0.6 km' },
    { id: '2', nombre: 'Dr. Samuel Rivera', distancia: '1.8 km' },
  ],
};

export default function NuevoTurno() {
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(null);
  const [mostrarDoctores, setMostrarDoctores] = useState(false);
  const [mostrarCalendario, setMostrarCalendario] = useState(false); 
  const [titulo, setTitulo] = useState('Nuevo Turno');

  const especialidades = [
    { id: '1', especialidad: 'Ginecología', imagen: require('../(tabs)/especialidad_imagenes/ginecologia.png') },
    { id: '2', especialidad: 'Cardiología', imagen: require('../(tabs)/especialidad_imagenes/cardiologia.png') },
    { id: '3', especialidad: 'Dermatología', imagen: require('../(tabs)/especialidad_imagenes/dermatologia.png') },
    { id: '4', especialidad: 'Pediatría', imagen: require('../(tabs)/especialidad_imagenes/pediatria.png') },
  ];

  const manejarSeleccionEspecialidad = (especialidad) => {
    setEspecialidadSeleccionada(especialidad);
    setMostrarDoctores(true);
    setTitulo(especialidad);
  };

  const atras = () => {
    if (mostrarDoctores) {
      setMostrarDoctores(false);
      setEspecialidadSeleccionada(null);
      setTitulo('Nuevo Turno');
    } else {
      setMostrarCalendario(false); 
    }
  };

  const alternarCalendario = () => {
    setMostrarCalendario(!mostrarCalendario);
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.cabecera}>
        <Icono name="chevron-back-outline" size={24} color="#000" onPress={atras} />
        <Text style={styles.titulo}>{titulo}</Text>
      </View>

      <TextInput
        style={styles.inputBusqueda}
        placeholder="Buscar especialidad"
        placeholderTextColor="#888"
      />

      {!mostrarDoctores ? (
        <FlatList
          data={especialidades}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.tarjeta} onPress={() => manejarSeleccionEspecialidad(item.especialidad)}>
              <View style={styles.contenidoTarjeta}>
                {item.imagen && <Image source={item.imagen} style={styles.imagenPlaceholder} />}
                <Text style={styles.textoEspecialidad}>{item.especialidad}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.contenedorDoctores}>
          <Text style={styles.tituloEspecialidad}>{especialidadSeleccionada}</Text>
          <FlatList
            data={datosDoctores[especialidadSeleccionada]}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.tarjetaDoctor}>
                <Text style={styles.nombreDoctor}>{item.nombre}</Text>
                <Text style={styles.distanciaDoctor}>{item.distancia}</Text>
                <View style={styles.contenedorBotones}>
                  <TouchableOpacity style={styles.boton}>
                    <Text style={styles.textoBoton}>Adjuntar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.boton} onPress={alternarCalendario}>
                    <Text style={styles.textoBoton}>Ver Agenda</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      )}

      {mostrarCalendario && (
        <View style={styles.contenedorCalendario}>
          <Calendar
            current={new Date().toISOString().split('T')[0]}
            onDayPress={(day) => { console.log('Día seleccionado', day); }}
            monthFormat={'MMMM yyyy'}
            onMonthChange={(month) => { console.log('Mes cambiado', month); }}
          />
          <Text style={styles.etiquetaMes}>
            {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    padding: 10,
  },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    elevation: 2,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  inputBusqueda: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  tarjeta: {
    backgroundColor: '#b3e5fc',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    width: '45%',
    aspectRatio: 1,
  },
  contenidoTarjeta: {
    alignItems: 'center',
    padding: 10,
  },
  imagenPlaceholder: {
    width: 100,
    height: 100,
    marginBottom: 5,
  },
  textoEspecialidad: {
    fontSize: 16,
    marginTop: 5,
  },
  contenedorDoctores: {
    marginTop: 20,
  },
  tituloEspecialidad: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tarjetaDoctor: {
    backgroundColor: '#b3e5fc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  nombreDoctor: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  distanciaDoctor: {
    fontSize: 14,
    color: '#888',
  },
  contenedorBotones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  boton: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    width: '45%',
    alignItems: 'center',
  },
  textoBoton: {
    color: '#007aff',
  },
  contenedorCalendario: {
    marginTop: 10, 
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  etiquetaMes: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
});
