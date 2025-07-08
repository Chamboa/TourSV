import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useFonts, Roboto_700Bold } from '@expo-google-fonts/roboto';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  let [fontsLoaded] = useFonts({ Roboto_700Bold });
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.replace('Login');
    }, 2000);
    return () => clearTimeout(timeout);
  }, [navigation]);
  if (!fontsLoaded) return null;
  return (
    <View style={styles.container}>
      {/* Círculo decorativo minimalista */}
      <View style={styles.circle} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>TourSV</Text>
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
  circle: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: '#A3B65A22',
    top: height * 0.22,
    left: width * 0.2,
    zIndex: 1,
  },
  textContainer: {
    zIndex: 2,
    alignItems: 'center',
    marginTop: -40,
  },
  title: {
    color: '#2E5006',
    fontSize: 32,
    fontFamily: 'Roboto_700Bold',
    textAlign: 'center',
    fontWeight: 'normal',
    letterSpacing: 1,
  },
}); 