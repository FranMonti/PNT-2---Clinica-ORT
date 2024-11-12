import React, { useState } from "react";
import {
  Alert,
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Icono from "react-native-vector-icons/Ionicons";
import { Calendar } from "react-native-calendars";
import AsyncStorage from '@react-native-async-storage/async-storage';


const datosDoctores = {
  Ginecología: [
    { id: "1", nombre: "Dr. Ana López", distancia: "0.3 km" },
    { id: "2", nombre: "Dr. Carlos Martínez", distancia: "0.7 km" },
    { id: "3", nombre: "Dra. Sofia Ramírez", distancia: "1.1 km" },
  ],
  Cardiología: [
    { id: "1", nombre: "Dr. Javier Gómez", distancia: "0.4 km" },
    { id: "2", nombre: "Dra. Lucia Fernández", distancia: "1.2 km" },
    { id: "3", nombre: "Dr. Roberto Torres", distancia: "2.0 km" },
  ],
  Dermatología: [
    { id: "1", nombre: "Dr. Hugo Sánchez", distancia: "0.5 km" },
    { id: "2", nombre: "Dra. Paula Díaz", distancia: "1.5 km" },
  ],
  Pediatría: [
    { id: "1", nombre: "Dra. Elena Castro", distancia: "0.6 km" },
    { id: "2", nombre: "Dr. Samuel Rivera", distancia: "1.8 km" },
  ],
};

export default function NuevoTurno() {
  const [especialidadSeleccionada, setEspecialidadSeleccionada] =
  useState(null);
  const [doctorSeleccionado, setDoctorSeleccionado] = useState({ id: "", nombre: "" });
  const [mostrarDoctores, setMostrarDoctores] = useState(false);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [titulo, setTitulo] = useState("Nuevo Turno");
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const especialidades = [
    {
      id: "1",
      especialidad: "Ginecología",
      imagen: require("../(tabs)/especialidad_imagenes/ginecologia.png"),
    },
    {
      id: "2",
      especialidad: "Cardiología",
      imagen: require("../(tabs)/especialidad_imagenes/cardiologia.png"),
    },
    {
      id: "3",
      especialidad: "Dermatología",
      imagen: require("../(tabs)/especialidad_imagenes/dermatologia.png"),
    },
    {
      id: "4",
      especialidad: "Pediatría",
      imagen: require("../(tabs)/especialidad_imagenes/pediatria.png"),
    },
  ];

  const generarHorarios = (esHoy) => {
    const horarios = [];
    let hora = 9;
    let minuto = 0;

    const ahora = new Date();
    const horaActual = ahora.getHours();
    const minutoActual = ahora.getMinutes();

    while (hora < 18 || (hora === 17 && minuto <= 30)) {
      if (
        !esHoy ||
        hora > horaActual ||
        (hora === horaActual && minuto > minutoActual)
      ) {
        const formatoHora = `${hora.toString().padStart(2, "0")}:${minuto
          .toString()
          .padStart(2, "0")}`;
        horarios.push(formatoHora);
      }

      minuto += 30;
      if (minuto === 60) {
        minuto = 0;
        hora++;
      }
    }

    return horarios;
  };

  const onDayPress = (day) => {
    const hoy = new Date().toISOString().split("T")[0];
    const esHoy = day.dateString === hoy;

    setSelectedDay(day.dateString);
    setHorasDisponibles(generarHorarios(esHoy));
  };

  const manejarSeleccionEspecialidad = (especialidad) => {
    setEspecialidadSeleccionada(especialidad);
    setMostrarDoctores(true);
    setTitulo(especialidad);
  };

  const atras = () => {
    setMostrarCalendario(false);
    if (mostrarDoctores) {
      setMostrarDoctores(false);
      setEspecialidadSeleccionada(null);
      setTitulo("Nuevo Turno");
    }
  };

  const alternarCalendario = () => {
    setMostrarCalendario(!mostrarCalendario);
  };

  const seleccionarDoctor = (doctor) => {
    setDoctorSeleccionado({ id: doctor.id, nombre: doctor.nombre });
    alternarCalendario();
  };

  const seleccionarHora = (hora) => {
    setSelectedTime(hora);
    setMostrarConfirmacion(true);
  };


  const crearTurno = async () => {
    const nuevoTurno = {
      especialidad: especialidadSeleccionada,
      doctor: doctorSeleccionado.nombre,
      doctorId: doctorSeleccionado.id,
      fecha: selectedDay,
      hora: selectedTime,
    };
    
    try {
      const pacienteId = await AsyncStorage.getItem('PacienteId'); // Obtiene el PacienteId
  
      if (!pacienteId) {
        throw new Error("No se encontró el PacienteId en la sesión");
      }
  
      nuevoTurno.pacienteId = pacienteId; // Añade el PacienteId al turno
  
      const response = await fetch('https://672982836d5fa4901b6d6322.mockapi.io/api/bd/Turno', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoTurno),
      });
  
      if (!response.ok) {
        throw new Error("Error al crear el turno");
      }
  
      const data = await response.json();
      console.log("Turno creado:", data);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return (
    <View style={styles.contenedor}>
      <View style={styles.cabecera}>
        <Icono
          name="chevron-back-outline"
          size={24}
          color="#000"
          onPress={atras}
        />
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
            <TouchableOpacity
              style={styles.tarjeta}
              onPress={() => manejarSeleccionEspecialidad(item.especialidad)}
            >
              <View style={styles.contenidoTarjeta}>
                {item.imagen && (
                  <Image
                    source={item.imagen}
                    style={styles.imagenPlaceholder}
                  />
                )}
                <Text style={styles.textoEspecialidad}>
                  {item.especialidad}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.contenedorDoctores}>
          <Text style={styles.tituloEspecialidad}>
            {especialidadSeleccionada}
          </Text>
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
                  <TouchableOpacity
                    style={styles.boton}
                    onPress={() => seleccionarDoctor(item)}
                  >
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
          <View style={styles.headerHoras}>
            <Text style={styles.textoSeleccionHorario}>Seleccione día</Text>
            <TouchableOpacity
              onPress={() => setMostrarCalendario(false)}
              style={styles.botonCerrar}
            >
              <Text style={styles.textoBotonCerrar}>Cerrar</Text>
            </TouchableOpacity>
          </View>
          <Calendar
            current={new Date().toLocaleDateString("en-CA")}
            minDate={new Date().toLocaleDateString("en-CA")}
            onDayPress={(day) => {
              setSelectedDay(day.dateString);
              setHorasDisponibles(generarHorarios());
            }}
            monthFormat={"MMMM yyyy"}
          />
        </View>
      )}

      {selectedDay && (
        <View style={styles.contenedorHoras}>
          <View style={styles.headerHoras}>
            <Text style={styles.textoSeleccionHorario}>Seleccione horario</Text>
            <TouchableOpacity
              onPress={() => setSelectedDay(null)}
              style={styles.botonCerrarHoras}
            >
              <Text style={styles.textoBotonCerrar}>Cerrar</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={horasDisponibles}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ paddingTop: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.botonHora}
                onPress={() => seleccionarHora(item)}
              >
                <Text style={styles.textoHora}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {mostrarConfirmacion && (
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.tituloConfirmacion}>
              Verifique su Nuevo Turno
            </Text>
            <Text style={styles.textoConfirmacion}>
              {"\n"}
              Especialidad: {especialidadSeleccionada}
              {"\n"}
              Doctor: {doctorSeleccionado.nombre}
              {"\n"}
              Fecha: {selectedDay}
              {"\n"}
              Hora: {selectedTime}
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <TouchableOpacity
                onPress={() => {
                  setMostrarConfirmacion(false);
                  setSelectedDay(null);
                  setDoctorSeleccionado("");
                  setSelectedTime("");
                  setEspecialidadSeleccionada("");
                  setMostrarDoctores(false);
                  setMostrarCalendario(false);

                  crearTurno();

                  Alert.alert(
                    "Confirmación de Turno",
                    "SU TURNO HA SIDO GUARDADO EXITOSAMENTE!",
                    [
                      { text: "OK", onPress: () => console.log("Turno guardado") }
                    ]
                  );
                }}
                style={styles.botonConfirmar}
              >
                <Text style={styles.textoBotonBlanco}>Confirmo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setMostrarCalendario(true); 
                  setMostrarConfirmacion(false);
                }}
                style={styles.botonAtras}
              >
                <Text style={styles.textoBotonBlanco}>Atrás</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#f0f8ff",
    padding: 10,
    paddingTop: 50,
    paddingLeft: 20,
  },
  cabecera: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    elevation: 2,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  inputBusqueda: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  tarjeta: {
    backgroundColor: "#b3e5fc",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    margin: 5,
    width: "45%",
    aspectRatio: 1,
  },
  contenidoTarjeta: {
    alignItems: "center",
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
    fontWeight: "bold",
    marginBottom: 10,
  },
  tarjetaDoctor: {
    backgroundColor: "#b3e5fc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  nombreDoctor: {
    fontSize: 16,
    fontWeight: "bold",
  },
  distanciaDoctor: {
    fontSize: 14,
    color: "#888",
  },
  contenedorBotones: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  boton: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    width: "45%",
    alignItems: "center",
  },
  textoBoton: {
    color: "#007aff",
  },
  contenedorCalendario: {
    position: "absolute",
    width: "80%",
    height: "50%",
    top: "45%",
    left: "13%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    zIndex: 10,
  },

  etiquetaMes: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  botonCerrar: {
    alignSelf: "flex-end",
    backgroundColor: "#ff5c5c",
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  textoBotonCerrar: {
    color: "#fff",
    fontWeight: "bold",
  },
  contenedorHoras: {
    marginTop: 20,
  },
  textoSeleccionDia: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  contenedorHoras: {
    position: "absolute",
    top: "45%",
    left: "13%",
    width: "80%",
    height: "50%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    paddingTop: 20,
    elevation: 3,
    zIndex: 20,
  },
  botonCerrar: {
    alignSelf: "flex-end",
    backgroundColor: "#ff5c5c",
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  botonCerrarHoras: {
    alignSelf: "flex-end",
    backgroundColor: "#ff5c5c",
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  textoBotonCerrar: {
    color: "#fff",
    fontWeight: "bold",
  },
  botonHora: {
    backgroundColor: "#b3e5fc",
    borderRadius: 8,
    padding: 15,
    marginVertical: 5,
    alignItems: "center",
  },
  textoHora: {
    fontSize: 16,
    color: "#007aff",
  },
  headerHoras: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  textoSeleccionHorario: {
    fontSize: 16,
    fontWeight: "bold",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "110%",
    height: "110%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    textAlign: "center",
    width: "80%",
    alignItems: "center",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
  },
  tituloConfirmacion: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  textoConfirmacion: {
    fontSize: 16,
    marginBottom: 20,
  },
  botonCerrarModal: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
  },
  textoBotonCerrarModal: {
    color: "#fff",
    fontSize: 16,
  },
  botonConfirmar: {
    backgroundColor: "green",
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  botonAtras: {
    backgroundColor: "red",
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  textoBotonBlanco: {
    color: 'white',
  textAlign: 'center',
  },
  
});

