import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { useFonts, Roboto_700Bold } from '@expo-google-fonts/roboto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser } from './api';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [isLoading, setIsLoading] = useState(false);
  let [fontsLoaded] = useFonts({ Roboto_700Bold });
  if (!fontsLoaded) return null;
  const handleRegister = async () => {
    // Validaciones básicas
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Por favor ingresa una contraseña');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUser(name, email, password, role);
      if (res.user) {
        // Mostrar mensaje de éxito
        Alert.alert(
          '¡Registro Exitoso!', 
          'Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Limpiar los campos del formulario
                setName('');
                setEmail('');
                setPassword('');
                setRole('user');
                // Navegar a la pantalla de login
                navigation.navigate('SignIn');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', res.error || 'Registro fallido');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setIsLoading(false);
    }
  };
  const roleOptions = [
    {
      key: 'user',
      label: 'Cliente',
      desc: 'Explora y guarda lugares turísticos, deja reseñas y organiza tu calendario.'
    },
    {
      key: 'empresa',
      label: 'Empresa',
      desc: 'Publica y administra tus propios lugares turísticos en la app.'
    }
  ];
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#A3B65A"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#A3B65A"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#A3B65A"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <View style={{ width: '100%', marginBottom: 18 }}>
          <Text style={{ color: '#2E5006', fontWeight: 'bold', fontSize: 16, marginBottom: 8, textAlign: 'left' }}>Tipo de cuenta</Text>
          {roleOptions.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={{
                borderWidth: 2,
                borderColor: role === opt.key ? '#2E5006' : '#A3B65A',
                backgroundColor: role === opt.key ? '#E8F5E9' : '#fff',
                borderRadius: 14,
                padding: 14,
                marginBottom: 10
              }}
              onPress={() => setRole(opt.key)}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#2E5006', fontWeight: 'bold', fontSize: 15 }}>{opt.label}</Text>
              <Text style={{ color: '#666', fontSize: 13, marginTop: 2 }}>{opt.desc}</Text>
              {role === opt.key && <Text style={{ color: '#2E5006', fontWeight: 'bold', marginTop: 4 }}>Seleccionado</Text>}
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity 
          style={[styles.buttonPrimary, isLoading && styles.buttonDisabled]} 
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text style={styles.buttonPrimaryText}>
            {isLoading ? 'Creando cuenta...' : 'Create Account'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.buttonSecondary} 
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={styles.buttonSecondaryText}>Ya tengo cuenta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  content: {
    zIndex: 2,
    width: width * 0.8,
    alignItems: 'center',
    marginTop: -20,
  },
  title: {
    color: '#2E5006',
    fontSize: 22,
    fontFamily: 'Roboto_700Bold',
    marginBottom: 24,
    letterSpacing: 1,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#2E5006',
    borderWidth: 1,
    borderColor: '#A3B65A',
    marginBottom: 12,
    fontFamily: 'Roboto_700Bold',
  },
  buttonPrimary: {
    backgroundColor: '#2E5006',
    borderRadius: 18,
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonPrimaryText: {
    color: '#fff',
    fontFamily: 'Roboto_700Bold',
    fontSize: 15,
    letterSpacing: 1,
  },
  buttonDisabled: {
    backgroundColor: '#A3B65A',
    opacity: 0.7,
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#A3B65A',
  },
  buttonSecondaryText: {
    color: '#A3B65A',
    fontFamily: 'Roboto_700Bold',
    fontSize: 15,
    letterSpacing: 1,
  },
}); 