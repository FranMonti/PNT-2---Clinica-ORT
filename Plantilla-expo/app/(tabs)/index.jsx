import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  TextInput,
  ActivityIndicator,
  FlatList,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Formik } from "formik";
import * as yup from "yup";
import { especialidades } from '../../constants/especialidades';

// Importamos AsyncStorage para manejar el almacenamiento local
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GestionEspecialista() {
  const [view, setView] = useState("menu");
  const [especialistas, setEspecialistas] = useState([]);
  const [filteredEspecialistas, setFilteredEspecialistas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEspecialista, setSelectedEspecialista] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedSpeciality, setSelectedSpeciality] = useState("");
  const [selectedSucursalFilter, setSelectedSucursalFilter] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

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
    const checkAdminStatus = async () => {
      try {
        // Obtenemos el ID del usuario desde AsyncStorage
        const userId = await AsyncStorage.getItem('userId');
        console.log('Valor de userId obtenido de AsyncStorage:', userId);
        if (!userId) {
          // Si no hay usuario logueado, asumimos que no es admin
          setIsAdmin(false);
          setLoadingUser(false);
          return;
        }
        // Obtenemos los datos del usuario actual por su ID
        const response = await fetch(
          `https://67310dbe7aaf2a9aff0fb8c5.mockapi.io/Datos-Usuario/${userId}`
        );
        const currentUser = await response.json();
        setIsAdmin(currentUser?.esAdmin || false);
      } catch (error) {
        console.error("Error al verificar el usuario:", error);
        setIsAdmin(false);
      } finally {
        setLoadingUser(false);
      }
    };

    checkAdminStatus();
  }, []);

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
        "https://67310dbe7aaf2a9aff0fb8c5.mockapi.io/usuarios/especialista"
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
        "https://67310dbe7aaf2a9aff0fb8c5.mockapi.io/usuarios/especialista",
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

  const handleSubmitEdicion = async (updatedData) => {
    if (!selectedEspecialista?.id) {
      alert("Error: No se puede identificar al especialista");
      return;
    }

    try {
      setLoading(true);
      const updatedEspecialista = {
        ...selectedEspecialista,
        diasAtencion: updatedData.diasAtencion,
      };

      const response = await fetch(
        `https://67310dbe7aaf2a9aff0fb8c5.mockapi.io/usuarios/especialista/${selectedEspecialista.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedEspecialista),
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error del servidor:", errorResponse);
        throw new Error(errorResponse.message || "Error al actualizar");
      }

      alert("Especialista actualizado exitosamente");
      setModalVisible(false);
      await getEspecialistas();
    } catch (error) {
      console.error("Error al actualizar el especialista:", error);
      alert(
        "Error: " + (error.message || "No se pudo actualizar el especialista")
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Bienvenido a Clínica ORT</Text>
        <Text>No tienes permisos para acceder a esta sección.</Text>
      </View>
    );
  }

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
                  {especialidades.map((especialidad, index) => (
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
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleEditEspecialista(item)}
                  style={styles.especialistaCard}
                >
                  <Text style={styles.especialistaName}>
                    {item.name} {item.apellido}
                  </Text>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditEspecialista(item)}
                  >
                    <Text style={styles.editButtonText}>Editar</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          )}
          <TouchableOpacity
            style={styles.volverButton}
            onPress={() => setView("menu")}
          >
            <Text style={styles.volverButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={modalVisible} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar Días de Atención</Text>
            {selectedEspecialista && (
              <Formik
                initialValues={{
                  diasAtencion: selectedEspecialista.diasAtencion || [],
                }}
                onSubmit={(values) => {
                  handleSubmitEdicion({
                    diasAtencion: values.diasAtencion, // Solo los días actualizados
                  });
                }}
              >
                {({ handleSubmit, setFieldValue, values }) => (
                  <View>
                    {/* Lista de días de atención */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Días de Atención</Text>
                      <Picker
                        selectedValue=""
                        onValueChange={(itemValue) => {
                          if (
                            itemValue &&
                            !values.diasAtencion.includes(itemValue)
                          ) {
                            setFieldValue("diasAtencion", [
                              ...values.diasAtencion,
                              itemValue,
                            ]);
                          }
                        }}
                        style={styles.picker}
                      >
                        <Picker.Item label="Seleccione un día" value="" />
                        {diasSemana
                          .filter((dia) => !values.diasAtencion.includes(dia))
                          .map((dia, index) => (
                            <Picker.Item key={index} label={dia} value={dia} />
                          ))}
                      </Picker>
                    </View>

                    {/* Días seleccionados */}
                    <View style={styles.selectedDaysContainer}>
                      <Text style={styles.label}>Días Seleccionados:</Text>
                      <View style={styles.daysContainer}>
                        {values.diasAtencion.map((dia, index) => (
                          <View key={index} style={styles.dayItem}>
                            <Text style={styles.dayText}>{dia}</Text>
                            <TouchableOpacity
                              onPress={() =>
                                setFieldValue(
                                  "diasAtencion",
                                  values.diasAtencion.filter((d) => d !== dia)
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

                    {/* Botones */}
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setModalVisible(false)}
                      >
                        <Text style={styles.buttonText}>Cerrar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSubmit} // Llama a Formik handleSubmit
                      >
                        <Text style={styles.buttonText}>Guardar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </Formik>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginTop: 4,
    borderRadius: 4,
  },
  errorText: {
    color: "red",
  },
  picker: {
    marginTop: 4,
  },
  selectedDaysContainer: {
    marginBottom: 16,
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    marginTop: 4,
    backgroundColor: "#eee",
    padding: 4,
    borderRadius: 4,
  },
  dayText: {
    marginRight: 4,
  },
  removeButton: {
    padding: 4,
  },
  removeButtonText: {
    color: "red",
  },
  especialistaCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  especialistaName: {
    fontSize: 16,
  },
  editButton: {
    marginTop: 8,
  },
  editButtonText: {
    color: "blue",
  },
  volverButton: {
    marginTop: 16,
  },
  volverButtonText: {
    color: "blue",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    margin: 16,
    padding: 16,
    borderRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  label: {
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: "gray",
    padding: 12,
    borderRadius: 4,
  },
  saveButton: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 4,
  },
  buttonText: {
    color: "white",
  },
});
