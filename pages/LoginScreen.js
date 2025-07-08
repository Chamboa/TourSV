import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useFonts, Roboto_700Bold } from '@expo-google-fonts/roboto';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  let [fontsLoaded] = useFonts({ Roboto_700Bold });
  if (!fontsLoaded) return null;
  return (
    <View style={styles.container}>
      {/* Icono decorativo plano */}
      <View style={styles.iconDecor} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>TourSV</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buttonPrimary} onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.buttonPrimaryText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.buttonSecondaryText}>Create Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonTertiary} onPress={() => navigation.navigate('Splash')}>
          <Text style={styles.buttonTertiaryText}>Skip</Text>
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
  iconDecor: {
    position: 'absolute',
    top: 60,
    left: width / 2 - 32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#A3B65A22',
    zIndex: 2,
  },
  textContainer: {
    zIndex: 3,
    alignItems: 'center',
    marginTop: -20,
    marginBottom: 30,
  },
  title: {
    color: '#2E5006',
    fontSize: 28,
    fontFamily: 'Roboto_700Bold',
    textAlign: 'center',
    fontWeight: 'normal',
    letterSpacing: 1,
  },
  buttonContainer: {
    zIndex: 3,
    width: width * 0.8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonPrimary: {
    backgroundColor: '#A3B65A',
    borderRadius: 22,
    paddingVertical: 10,
    width: '100%',
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: '#2E5006',
    fontFamily: 'Roboto_700Bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  buttonSecondary: {
    backgroundColor: '#0984A3',
    borderRadius: 22,
    paddingVertical: 10,
    width: '100%',
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: '#fff',
    fontFamily: 'Roboto_700Bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  buttonTertiary: {
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A3B65A',
  },
  buttonTertiaryText: {
    color: '#A3B65A',
    fontFamily: 'Roboto_700Bold',
    fontSize: 16,
    letterSpacing: 1,
  },
});