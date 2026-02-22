import {
  Image,
  StyleSheet,
  Platform,
  View,
  Text,
  TextInput,
  Button,
  Switch,
  TouchableOpacity,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from "./context/userContext";
import { styles } from "../src/estilosIndex";


export default function Login() {
  const [esLogin, setEsLogin] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validations, setValidations] = useState({
    username: false,
    email: false,
    minLength: false,
    specialChar: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  const router = useRouter();
  const { updateUser } = useUser(); 

  const validateInputs = () => {
    setValidations({
      username: usuario.length > 5,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      minLength: password.length >= 8,
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    });
  };

  useEffect(() => {
    validateInputs();
  }, [usuario, email, password]);

  const handleLogin = async () => {
    try {
      const response = await fetch("https://67310dbe7aaf2a9aff0fb8c5.mockapi.io/Datos-Usuario");
  
      if (!response.ok) {
        console.error("Error en la respuesta:", response.status);
        alert("Error al conectar con el servidor.");
        return;
      }
  
      const data = await response.json();
      
      const user = data.find((u) => u.usuario === usuario && u.password === password);
  
      if (user) {
        await updateUser(user);
        console.log('ID de inicio de secion, LOGIN:', user.id);
        alert("Login Conseguido");
        router.push("/(tabs)");
      } else {
        alert("Login Fallido");
      }
    } catch (error) {
      console.error("Error en la autenticación:", error);
      alert("Error en la autenticación");
    }
  };
  
  const handleRegister = async () => {
    console.log('Usuario: ', usuario);
    console.log('Password: ', password);
  
    try {
      const response = await fetch('https://67310dbe7aaf2a9aff0fb8c5.mockapi.io/Datos-Usuario');
      const data = await response.json();
      
      const userExist = data.some((u) => u.usuario === usuario);
      const emailExist = data.some((u) => u.email === email);
  
      if (userExist) {
        alert('Usuario ya registrado');
      } else if (emailExist) {
        alert('Email ya registrado');
      } else {
        const body = JSON.stringify({
          usuario: usuario,
          email: email,
          password: password,
        });
  
        const registerResponse = await fetch('https://67310dbe7aaf2a9aff0fb8c5.mockapi.io/Datos-Usuario', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: body
        });
  
        if (registerResponse.ok) {
          alert('Registro Exitoso');
          const nuevoUsuario = await registerResponse.json();
  
          await updateUser(nuevoUsuario);
          console.log('Usuario registrado:', nuevoUsuario);
          console.log("PacienteId almacenado después del registro:", nuevoUsuario.id);
  
          router.push('/(tabs)');
        } else {
          alert('Error al registrar el usuario');
        }
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      alert('Error en la autenticación');
    }
  };

  const toggleMode = () => {
    setEsLogin((prev) => !prev);
    setUsuario("");
    setEmail("");
    setPassword("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{esLogin ? "Login" : "Clinica ORT"}</Text>
      <Text>Usuario:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su Usuario"
        value={usuario}
        onChangeText={setUsuario}
      />
      {!esLogin && (
        <Text style={[styles.validationText, validations.username ? styles.validationSuccess : styles.validationError]}>
          {validations.username ? "✓" : "✗"} Nombre de usuario (mínimo 6 caracteres)
        </Text>
      )}

      {!esLogin && (
        <>
          <Text>Email:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su Email"
            value={email}
            onChangeText={setEmail}
          />
          <Text style={[styles.validationText, validations.email ? styles.validationSuccess : styles.validationError]}>
            {validations.email ? "✓" : "✗"} Email válido (contiene '@')
          </Text>
        </>
      )}

      <Text>Password:</Text>
      <TextInput
        secureTextEntry={true}
        style={styles.input}
        placeholder="Ingrese su password"
        value={password}
        onChangeText={setPassword}
      />

      {!esLogin && (
        <View style={[styles.validationContainer, { marginBottom: 20 }]}>
          <Text style={[styles.validationText, validations.minLength ? styles.validationSuccess : styles.validationError]}>
            {validations.minLength ? "✓" : "✗"} Contraseña (mínimo 8 caracteres)
          </Text>
          <Text style={[styles.validationText, validations.specialChar ? styles.validationSuccess : styles.validationError]}>
            {validations.specialChar ? "✓" : "✗"} 1 carácter especial
          </Text>
          <Text style={[styles.validationText, validations.uppercase ? styles.validationSuccess : styles.validationError]}>
            {validations.uppercase ? "✓" : "✗"} 1 letra mayúscula
          </Text>
          <Text style={[styles.validationText, validations.lowercase ? styles.validationSuccess : styles.validationError]}>
            {validations.lowercase ? "✓" : "✗"} 1 letra minúscula
          </Text>
          <Text style={[styles.validationText, validations.number ? styles.validationSuccess : styles.validationError]}>
            {validations.number ? "✓" : "✗"} 1 número
          </Text>
        </View>
      )}

      <View style={styles.register}>
        <TouchableOpacity
          style={styles.button}
          onPress={esLogin ? handleLogin : handleRegister}
        >
          <Text style={styles.buttonText}>
            {esLogin ? "Iniciar Sesión" : "Regístrate"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>
          {esLogin ? "Cambia a Registro" : "Cambia a Login"}
        </Text>
        <Switch value={esLogin} onValueChange={toggleMode} />
      </View>
    </View>
  );
}


