import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { useFonts, Roboto_700Bold } from '@expo-google-fonts/roboto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from './api';

const { width, height } = Dimensions.get('window');

export default function LoginFormScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  let [fontsLoaded] = useFonts({ Roboto_700Bold });
  if (!fontsLoaded) return null;
  const handleSignIn = async () => {
    try {
      const res = await loginUser(email, password);
      console.log('Respuesta del login:', res);
      if (res.user) {
        await AsyncStorage.removeItem('user');
        await AsyncStorage.setItem('user', JSON.stringify(res.user));
        console.log('Usuario guardado en AsyncStorage');
        if (res.user.role === 'empresa') {
          navigation.reset({ index: 0, routes: [{ name: 'AuthenticatedDrawer' }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'AuthenticatedDrawer' }] });
        }
      } else {
        if (res.error === 'Usuario no encontrado') {
          Alert.alert('Error', 'El usuario no existe. Verifica tu email.');
        } else if (res.error === 'Contraseña incorrecta') {
          Alert.alert('Error', 'La contraseña es incorrecta. Intenta de nuevo.');
        } else {
          Alert.alert('Error', res.error || 'Login fallido');
        }
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Sign In</Text>
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
        <TouchableOpacity onPress={() => alert('Forgot password?')}>
          <Text style={styles.forgot}>Forgot password?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonPrimary} onPress={handleSignIn}>
          <Text style={styles.buttonPrimaryText}>Sign In</Text>
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
  forgot: {
    color: '#0984A3',
    alignSelf: 'flex-end',
    marginBottom: 16,
    fontWeight: 'bold',
    fontFamily: 'Roboto_700Bold',
    fontSize: 13,
  },
  buttonPrimary: {
    backgroundColor: '#A3B65A',
    borderRadius: 18,
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: '#2E5006',
    fontFamily: 'Roboto_700Bold',
    fontSize: 15,
    letterSpacing: 1,
  },
}); 