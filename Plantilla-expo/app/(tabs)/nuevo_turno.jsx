import React, { useState, useEffect } from 'react';
import {
  Alert,
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icono from 'react-native-vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

const imagenesPorEspecialidad = {
  'Ginecología': require('../(tabs)/especialidad_imagenes/ginecologia.png'),
  'Cardiología': require('../(tabs)/especialidad_imagenes/cardiologia.png'),
  'Dermatología': require('../(tabs)/especialidad_imagenes/dermatologia.png'),
  'Pediatría': require('../(tabs)/especialidad_imagenes/pediatria.png'),
};

export default function NuevoTurno() {
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(null);
  const [doctorSeleccionado, setDoctorSeleccionado] = useState(null);
  const [mostrarDoctores, setMostrarDoctores] = useState(false);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [titulo, setTitulo] = useState('Nuevo Turno');
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [especialistas, setEspecialistas] = useState([]);
  const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState([]);
  const [diasHabilitados, setDiasHabilitados] = useState({});
  const [busqueda, setBusqueda] = useState('');

  const nombreDiaANumero = {
    'Domingo': 0,
    'Lunes': 1,
    'Martes': 2,
    'Miércoles': 3,
    'Jueves': 4,
    'Viernes': 5,
    'Sábado': 6,
  };

  const getEspecialistas = async () => {
    try {
      const response = await fetch('https://67310dbe7aaf2a9aff0fb8c5.mockapi.io/usuarios/especialista');
      const data = await response.json();
      setEspecialistas(data);

      if (data) {
        const especialidadesUnicas = [...new Set(
          data
            .filter(especialista => especialista.activo)
            .map(especialista => especialista.especialidad)
        )];

        const especialidadesFormateadas = especialidadesUnicas.map((especialidad, index) => ({
          id: String(index + 1),
          especialidad: especialidad,
          imagen: imagenesPorEspecialidad[especialidad] || null,
        }));

        setEspecialidadesDisponibles(especialidadesFormateadas);
      } else {
        alert('Fallo al obtener profesionales');
      }
    } catch (error) {
      console.error(error);
      alert('Error en la obtención de profesionales');
    }
  };

  useEffect(() => {
    getEspecialistas();
  }, []);

  const generarDiasHabilitados = (diasAtencion) => {
    const fechasHabilitadas = {};
    const hoy = new Date();

    for (let i = 0; i < 90; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      const fechaStr = fecha.toISOString().split('T')[0];
      const diaSemana = fecha.getDay();

      const esDiaHabilitado = diasAtencion.some(dia =>
        nombreDiaANumero[dia] === diaSemana
      );

      if (esDiaHabilitado) {
        fechasHabilitadas[fechaStr] = {
          selected: false,
          marked: true,
          dotColor: '#4CAF50',
          activeOpacity: 0,
          disableTouchEvent: false,
        };
      } else {
        fechasHabilitadas[fechaStr] = {
          disabled: true,
          disableTouchEvent: true,
          textColor: '#d9e1e8',
          activeOpacity: 0,
        };
      }
    }
    return fechasHabilitadas;
  };

  const obtenerDoctoresPorEspecialidad = (especialidad) => {
    return especialistas
      .filter(especialista =>
        especialista.especialidad === especialidad &&
        especialista.activo
      )
      .map(especialista => ({
        id: especialista.id,
        nombre: `Dr. ${especialista.name} ${especialista.apellido}`,
        diasAtencion: especialista.diasAtencion,
        distancia: '0.5 km',
      }));
  };

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
        const formatoHora = `${hora.toString().padStart(2, '0')}:${minuto
          .toString()
          .padStart(2, '0')}`;
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
    if (diasHabilitados[day.dateString]) {
      const nuevasFechas = { ...diasHabilitados };
      Object.keys(nuevasFechas).forEach(fecha => {
        if (nuevasFechas[fecha].selected) {
          nuevasFechas[fecha] = {
            ...nuevasFechas[fecha],
            selected: false,
          };
        }
      });
      nuevasFechas[day.dateString] = {
        ...nuevasFechas[day.dateString],
        selected: true,
      };
      setDiasHabilitados(nuevasFechas);
      setSelectedDay(day.dateString);
      const hoy = new Date().toISOString().split('T')[0];
      const esHoy = day.dateString === hoy;
      setHorasDisponibles(generarHorarios(esHoy));
    }
  };

  const manejarSeleccionEspecialidad = (especialidad) => {
    setEspecialidadSeleccionada(especialidad);
    setMostrarDoctores(true);
    setTitulo(especialidad);
  };

  const atras = () => {
    if (mostrarCalendario) {
      setMostrarCalendario(false);
      setDoctorSeleccionado(null);
      setSelectedDay(null);
      setSelectedTime('');
      setDiasHabilitados({});
    } else if (mostrarDoctores) {
      setMostrarDoctores(false);
      setEspecialidadSeleccionada(null);
      setTitulo('Nuevo Turno');
    }
  };

  const alternarCalendario = () => {
    setMostrarCalendario(!mostrarCalendario);
  };

  const seleccionarDoctor = (doctor) => {
    setDoctorSeleccionado(doctor);
    const doctorInfo = especialistas.find(esp => esp.id === doctor.id);
    if (doctorInfo && doctorInfo.diasAtencion) {
      const diasHabilitados = generarDiasHabilitados(doctorInfo.diasAtencion);
      setDiasHabilitados(diasHabilitados);
    }
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
      const pacienteId = await AsyncStorage.getItem('PacienteId');
      console.log('PacienteId recuperado de AsyncStorage:', pacienteId);

      if (!pacienteId) {
        console.error('Error: No se encontró el PacienteId en la sesión');
        Alert.alert('Error', 'No se encontró el ID del paciente. Por favor, inicie sesión.');
        return;
      }

      nuevoTurno.pacienteId = pacienteId;

      console.log('Turno enviado al servidor:', nuevoTurno);

      const response = await fetch('https://672982836d5fa4901b6d6322.mockapi.io/api/bd/Turno', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoTurno),
      });

      if (!response.ok) {
        throw new Error('Error al crear el turno');
      }

      const data = await response.json();
      console.log('Turno creado correctamente:', data);
      Alert.alert('Éxito', '¡Turno creado correctamente!');
    } catch (error) {
      console.error('Error al crear el turno:', error);
      Alert.alert('Error', 'No se pudo guardar el turno.');
    }
  };

  const especialidadesFiltradas = especialidadesDisponibles.filter(
    esp => esp.especialidad.toLowerCase().includes(busqueda.toLowerCase())
  );

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
        value={busqueda}
        onChangeText={setBusqueda}
      />

      {!mostrarDoctores ? (
        <FlatList
          data={especialidadesFiltradas}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.tarjeta}
              onPress={() => manejarSeleccionEspecialidad(item.especialidad)}
            >
              <View style={styles.contenidoTarjeta}>
                {item.imagen && (
                  <Image source={item.imagen} style={styles.imagenPlaceholder} />
                )}
                <Text style={styles.textoEspecialidad}>{item.especialidad}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.contenedorDoctores}>
          <Text style={styles.tituloEspecialidad}>{especialidadSeleccionada}</Text>
          <FlatList
            data={obtenerDoctoresPorEspecialidad(especialidadSeleccionada)}
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
        <View style={styles.overlay}>
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
              current={new Date().toISOString().split('T')[0]}
              minDate={new Date().toISOString().split('T')[0]}
              markedDates={diasHabilitados}
              onDayPress={onDayPress}
              monthFormat={'MMMM yyyy'}
              disableAllTouchEventsForDisabledDays={true}
              theme={{
                textDisabledColor: '#d9e1e8',
                selectedDayBackgroundColor: '#4CAF50',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#4CAF50',
                dayTextColor: '#2d4150',
                textMonthFontWeight: 'bold',
                arrowColor: '#4CAF50',
              }}
            />
          </View>
        </View>
      )}

      {selectedDay && (
        <View style={styles.overlay}>
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
        </View>
      )}

      {mostrarConfirmacion && (
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.tituloConfirmacion}>
              Verifique su Nuevo Turno
            </Text>
            <Text style={styles.textoConfirmacion}>
              {'\n'}
              Especialidad: {especialidadSeleccionada}
              {'\n'}
              Doctor: {doctorSeleccionado.nombre}
              {'\n'}
              Fecha: {selectedDay}
              {'\n'}
              Hora: {selectedTime}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <TouchableOpacity
                onPress={() => {
                  setMostrarConfirmacion(false);
                  setSelectedDay(null);
                  setDoctorSeleccionado(null);
                  setSelectedTime('');
                  setEspecialidadSeleccionada(null);
                  setMostrarDoctores(false);
                  setMostrarCalendario(false);

                  crearTurno();

                  Alert.alert(
                    'Confirmación de Turno',
                    '¡SU TURNO HA SIDO GUARDADO EXITOSAMENTE!',
                    [{ text: 'OK', onPress: () => console.log('Turno guardado') }]
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

// Estilos
const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  inputBusqueda: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    margin: 16,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tarjeta: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  contenidoTarjeta: {
    alignItems: 'center',
    padding: 16,
  },
  imagenPlaceholder: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  textoEspecialidad: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contenedorDoctores: {
    flex: 1,
    padding: 16,
  },
  tituloEspecialidad: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tarjetaDoctor: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  nombreDoctor: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  distanciaDoctor: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  contenedorBotones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  boton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  textoBoton: {
    color: '#fff',
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contenedorCalendario: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    width: '90%',
  },
  contenedorHoras: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    width: '80%',
    height: '50%', 
  },
  headerHoras: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textoSeleccionHorario: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  botonCerrar: {
    padding: 8,
  },
  textoBotonCerrar: {
    color: '#007AFF',
    fontSize: 16,
  },
  botonHora: {
    padding: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    marginBottom: 8,
  },
  textoHora: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  modal: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 8,
    width: '80%',
  },
  tituloConfirmacion: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  textoConfirmacion: {
    fontSize: 16,
    marginBottom: 24,
  },
  botonConfirmar: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  botonAtras: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  textoBotonBlanco: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
});
