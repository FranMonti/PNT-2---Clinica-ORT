import { 
    View, 
    Text, 
    Image, 
    StyleSheet, 
    FlatList, 
    Button,
    Animated,
    Easing,
    ActivityIndicator
  } from 'react-native';
  import { useRouter } from 'expo-router';
  import { useEffect, useState, useRef } from 'react';
  
  const LoadingSpinner = () => {
    const spinValue = useRef(new Animated.Value(0)).current;
  
    useEffect(() => {
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();
  
      return () => spinAnimation.stop();
    }, [spinValue]);
  
    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
  
    return (
      <View style={styles.spinnerContainer}>

        <Animated.View
          style={[
            styles.spinner,
            { transform: [{ rotate: spin }] }
          ]}
        />
        
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  };
  
  export default function HomeTabScreen() {
    const [users, setUsers] = useState([]);
    const [user, setUser] = useState(global.userData || {});
    const router = useRouter();
    
    console.log('user:', user);
  
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const respuesta = await fetch('https://randomuser.me/api/?results=1500');
          const data = await respuesta.json();
          setUsers(data.results);
        } catch (error) {
          console.error('error: ', error);
        }
      };
  
      fetchUsers();
    }, []);
  
    return (
      <View style={styles.container}>
        <Text style={styles.name}>Home Screen</Text>
  
        {user.admin && (
          <>
            <Button
              title="Carga Especialista"
              onPress={() => router.push('/(cargaEspecialista)')}
              style={styles.adminButton}
            />
            <Button
              title="Editar Especialista"
              onPress={() => router.push('/(editarEspecialista)')}
              style={styles.adminButton}
            />
          </>
        )}
  
        {users.length > 0 ? (
          <FlatList
            data={users}
            keyExtractor={(item) => item.login.uuid}
            renderItem={({ item }) => (
              <View style={styles.userContainer}>
                <Image source={{ uri: item.picture.large }} style={styles.image} />
                <View style={styles.infoContainer}>
                  <Text style={styles.name}>{item.name.first} {item.name.last}</Text>
                  <Text style={styles.detalle}>Nacionalidad: {item.nat}</Text>
                  <Text style={styles.detalle}>Edad: {item.dob.age}</Text>
                </View>
              </View>
            )}
          />
        ) : (
          <LoadingSpinner />
        )}
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'wheat',
      padding: 30,
    },
    spinnerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    userContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#c1bdbd',
      padding: 15,
      marginBottom: 15,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    image: {
      width: 70,
      height: 70,
      borderRadius: 35,
      marginRight: 15,
    },
    infoContainer: {
      flex: 1,
    },
    name: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
    },
    detalle: {
      fontSize: 16,
      color: '#666',
    },
    adminButton: {
      margin: 5,
      padding: 5,
    },
    spinner: {
      width: 50,
      height: 50,
      borderRadius: 25,
      borderWidth: 4,
      borderColor: 'transparent',
      borderTopColor: '#0000ff',
      borderLeftColor: '#0000ff',
    },
  });