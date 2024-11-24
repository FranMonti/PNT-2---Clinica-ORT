import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  FlatList,
  Switch,
  ActivityIndicator,
} from "react-native";
import { Formik } from "formik";
import * as yup from "yup";
import { Picker } from "@react-native-picker/picker";

export default function GestionEspecialista() {
  const [view, setView] = useState("menu"); // menu, cargar, editar
  const [especialistas, setEspecialistas] = useState([]);
  const [filteredEspecialistas, setFilteredEspecialistas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEspecialista, setSelectedEspecialista] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedSpeciality, setSelectedSpeciality] = useState("");
  const [selectedSucursalFilter, setSelectedSucursalFilter] = useState("");

  const diasSemana = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  const sucursales = [
    { id: 1, nombre: "Sucursal A" },
    { id: 2, nombre: "Sucursal B" },
    { id: 3, nombre: "Sucursal C" },
    { id: 4, nombre: "Sucursal D" },
  ];

  const validationSchema = yup.object().shape({
    name: yup.string().required("El nombre es requerido"),
    apellido: yup.string().required("El apellido es requerido"),
    dni: yup.string().required("El DNI es requerido"),
    sucursalId: yup.number().required("La sucursal es requerida"),
  });

  const initialValues = {
    name: "",
    apellido: "",
    dni: "",
    especialidad: "",
    sucursalId: "",
  };

  useEffect(() => {
    if (view === "editar") {
      getEspecialistas();
    }
  }, [view]);

  useEffect(() => {
    filterAndSortEspecialistas();
  }, [selectedSucursalFilter, especialistas]);

  const getEspecialistas = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://672aac9d976a834dd024100f.mockapi.io/api/especialistas/especialistas"
      );
      const data = await response.json();
      setEspecialistas(data);
    } catch (error) {
      console.error("Error al obtener especialistas:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortEspecialistas = () => {
    if (!especialistas || especialistas.length === 0) {
      setFilteredEspecialistas([]);
      return;
    }

    let filtered = [...especialistas];
    if (selectedSucursalFilter) {
      filtered = filtered.filter(
        (esp) =>
          esp.sucursalId && esp.sucursalId === Number(selectedSucursalFilter)
      );
    }
    filtered.sort((a, b) => a.apellido.localeCompare(b.apellido));
    setFilteredEspecialistas(filtered);
  };

  const handleSubmitCarga = async (values, { resetForm }) => {
    try {
      const response = await fetch(
        "https://672aac9d976a834dd024100f.mockapi.io/api/especialistas/especialistas",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...values,
            especialidad: selectedSpeciality,
            diasAtencion: selectedDays,
            activo: true,
            turnoId: [],
          }),
        }
      );
      if (response.ok) {
        resetForm({ values: initialValues });
        setSelectedDays([]);
        setSelectedSpeciality("");
        alert("¡Especialista creado exitosamente!");
      } else {
        throw new Error("Error al crear el especialista");
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleEditEspecialista = (especialista) => {
    setSelectedEspecialista(especialista);
    setSelectedDays(especialista.diasAtencion || []);
    setModalVisible(true);
  };

  const handleSubmitEdicion = async (values) => {
    if (!selectedEspecialista?.id) {
      alert("Error: No se puede identificar al especialista");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(
        `https://672aac9d976a834dd024100f.mockapi.io/api/especialistas/especialistas/${selectedEspecialista.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sucursalId: values.sucursalId || null,
            diasAtencion: selectedDays,
            activo: values.activo,
          }),
        }
      );
      if (response.ok) {
        alert("Especialista actualizado exitosamente");
        setModalVisible(false);
        getEspecialistas();
      } else {
        throw new Error("Error al actualizar el especialista");
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {view === "menu" && (
        <View>
          <Text style={styles.title}>Gestión de Especialistas</Text>
          <Button
            title="Cargar Especialista"
            onPress={() => setView("cargar")}
          />
          <Button
            title="Editar Especialista"
            onPress={() => setView("editar")}
          />
        </View>
      )}

      {view === "cargar" && (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmitCarga}
        >
          {({ handleChange, handleSubmit, values, errors, setFieldValue }) => (
            <ScrollView style={styles.scrollContainer}>
              <Text style={styles.title}>Cargar Especialista</Text>

              {/* Nombre */}
              <View style={styles.inputContainer}>
                <Text>Nombre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ingrese el nombre"
                  onChangeText={handleChange("name")}
                  value={values.name}
                />
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
              </View>

              {/* Apellido */}
              <View style={styles.inputContainer}>
                <Text>Apellido</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ingrese el apellido"
                  onChangeText={handleChange("apellido")}
                  value={values.apellido}
                />
                {errors.apellido && (
                  <Text style={styles.errorText}>{errors.apellido}</Text>
                )}
              </View>

              {/* DNI */}
              <View style={styles.inputContainer}>
                <Text>DNI</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ingrese el DNI"
                  keyboardType="numeric"
                  onChangeText={handleChange("dni")}
                  value={values.dni}
                />
                {errors.dni && (
                  <Text style={styles.errorText}>{errors.dni}</Text>
                )}
              </View>

              {/* Especialidad */}
              <View style={styles.inputContainer}>
                <Text>Especialidad</Text>
                <Picker
                  selectedValue={selectedSpeciality}
                  onValueChange={(itemValue) =>
                    setSelectedSpeciality(itemValue)
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccione una especialidad" value="" />
                  {[
                    "Cardiología",
                    "Dermatología",
                    "Ginecología",
                    "Pediatría",
                  ].map((especialidad, index) => (
                    <Picker.Item
                      key={index}
                      label={especialidad}
                      value={especialidad}
                    />
                  ))}
                </Picker>
              </View>

              {/* Sucursal */}
              <View style={styles.inputContainer}>
                <Text>Sucursal</Text>
                <Picker
                  selectedValue={values.sucursalId}
                  onValueChange={(itemValue) =>
                    setFieldValue("sucursalId", itemValue)
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccione una sucursal" value="" />
                  {sucursales.map((sucursal) => (
                    <Picker.Item
                      key={sucursal.id}
                      label={sucursal.nombre}
                      value={sucursal.id}
                    />
                  ))}
                </Picker>
                {errors.sucursalId && (
                  <Text style={styles.errorText}>{errors.sucursalId}</Text>
                )}
              </View>

              {/* Días de atención */}
              <View style={styles.inputContainer}>
                <Text>Días de Atención</Text>
                <Picker
                  selectedValue=""
                  onValueChange={(itemValue) => {
                    if (itemValue && !selectedDays.includes(itemValue)) {
                      setSelectedDays([...selectedDays, itemValue]);
                    }
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccione los días" value="" />
                  {diasSemana
                    .filter((dia) => !selectedDays.includes(dia))
                    .map((dia, index) => (
                      <Picker.Item key={index} label={dia} value={dia} />
                    ))}
                </Picker>
              </View>

              {/* Mostrar días seleccionados */}
              {selectedDays.length > 0 && (
                <View style={styles.selectedDaysContainer}>
                  <Text>Días seleccionados:</Text>
                  <View style={styles.daysContainer}>
                    {selectedDays.map((dia, index) => (
                      <View key={index} style={styles.dayItem}>
                        <Text style={styles.dayText}>{dia}</Text>
                        <TouchableOpacity
                          onPress={() =>
                            setSelectedDays(
                              selectedDays.filter((d) => d !== dia)
                            )
                          }
                          style={styles.removeButton}
                        >
                          <Text style={styles.removeButtonText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <Button title="Guardar Especialista" onPress={handleSubmit} />
              <Button title="Volver" onPress={() => setView("menu")} />
            </ScrollView>
          )}
        </Formik>
      )}

      {view === "editar" && (
        <View>
          <Text style={styles.title}>Editar Especialista</Text>
          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <FlatList
              data={filteredEspecialistas}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleEditEspecialista(item)}
                  style={styles.especialistaCard}
                >
                  <Text>
                    {item.name} {item.apellido}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
          <Button title="Volver" onPress={() => setView("menu")} />
        </View>
      )}

      <Modal visible={modalVisible} transparent>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Especialista</Text>
            {selectedEspecialista && (
              <Formik
                initialValues={{
                  sucursalId: selectedEspecialista.sucursalId || "",
                  activo: selectedEspecialista.activo || false,
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmitEdicion}
              >
                {({ handleSubmit, setFieldValue, values }) => (
                  <View>
                    <TextInput
                      style={styles.input}
                      placeholder="Nombre"
                      value={selectedEspecialista.name}
                      editable={false}
                    />
                    {/* Más inputs para edición */}
                    <Button title="Guardar" onPress={handleSubmit} />
                  </View>
                )}
              </Formik>
            )}
            <Button title="Cerrar" onPress={() => setModalVisible(false)} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
    marginTop: 5,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginTop: 5,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap", // Permite que los elementos pasen a la siguiente línea
    justifyContent: "space-between",
  },
  dayItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f7ff",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#007bff",
    marginBottom: 10,
    width: "48%", // Cada globo ocupará el 48% del ancho de la pantalla
  },
  dayText: {
    color: "#007bff",
    fontSize: 14,
    flex: 1,
  },

  removeButton: {
    marginLeft: 5,
    backgroundColor: "#ff5252",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
