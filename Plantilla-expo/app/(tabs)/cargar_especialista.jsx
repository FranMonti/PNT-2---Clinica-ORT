import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Correcto para manejar menús desplegables

const CargarEspecialista = () => {
  const [formData, setFormData] = useState({
    nombreEspecialista: '',
    apellidoEspecialista: '',
    dni: '',
    especialidad: '',
    matricula: '', 
  });

  const especialidades = ['Cardiología', 'Pediatría', 'Dermatología', 'Ginecología'];

  const verificarDuplicados = async () => {
    try {
      const response = await fetch(
        'https://67310dbe7aaf2a9aff0fb8c5.mockapi.io/usuarios/especialista'
      );

      if (!response.ok) {
        throw new Error('Error al verificar duplicados.');
      }

      const especialistas = await response.json();

      // Verificar si el DNI o la matrícula ya existen
      const dniDuplicado = especialistas.some(
        (especialista) => especialista.dni === formData.dni
      );
      const matriculaDuplicada = especialistas.some(
        (especialista) => especialista.matricula === formData.matricula
      );

      if (dniDuplicado) {
        Alert.alert('Error', 'El DNI ingresado ya está registrado.');
        return false;
      }

      if (matriculaDuplicada) {
        Alert.alert('Error', 'La matrícula ingresada ya está registrada.');
        return false;
      }

      return true; // No hay duplicados
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un problema al verificar duplicados.');
      console.error(error);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!formData.nombreEspecialista || !formData.apellidoEspecialista || !formData.dni || !formData.especialidad || !formData.matricula) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    // Verificar duplicados antes de enviar
    const esValido = await verificarDuplicados();
    if (!esValido) return;

    try {
      const response = await fetch(
        'https://67310dbe7aaf2a9aff0fb8c5.mockapi.io/usuarios/especialista',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        Alert.alert('Éxito', 'Especialista agregado correctamente.');
        setFormData({
          nombreEspecialista: '',
          apellidoEspecialista: '',
          dni: '',
          especialidad: '',
          matricula: '', // Restablecer la matrícula después de enviar
        });
      } else {
        Alert.alert('Error', 'No se pudo agregar el especialista.');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un problema al intentar guardar el especialista.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cargar Especialista</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre del especialista"
        value={formData.nombreEspecialista}
        onChangeText={(text) => setFormData({ ...formData, nombreEspecialista: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellido del especialista"
        value={formData.apellidoEspecialista}
        onChangeText={(text) => setFormData({ ...formData, apellidoEspecialista: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="DNI"
        value={formData.dni}
        keyboardType="numeric"
        onChangeText={(text) => setFormData({ ...formData, dni: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Matrícula"
        value={formData.matricula}
        onChangeText={(text) => setFormData({ ...formData, matricula: text })}
      />
      <Text style={styles.label}>Especialidad</Text>
      <Picker
        selectedValue={formData.especialidad}
        onValueChange={(itemValue) => setFormData({ ...formData, especialidad: itemValue })}
        style={styles.picker}
      >
        <Picker.Item label="Selecciona una especialidad" value="" />
        {especialidades.map((especialidad, index) => (
          <Picker.Item key={index} label={especialidad} value={especialidad} />
        ))}
      </Picker>
      <Button title="Guardar Especialista" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  picker: {
    height: 50,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default CargarEspecialista;
