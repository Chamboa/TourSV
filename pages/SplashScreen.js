import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { useFonts, Roboto_700Bold } from '@expo-google-fonts/roboto';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  let [fontsLoaded] = useFonts({ Roboto_700Bold });
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScaleAnim = useRef(new Animated.Value(0)).current;
  const dotAnim1 = useRef(new Animated.Value(1)).current;
  const dotAnim2 = useRef(new Animated.Value(1)).current;
  const dotAnim3 = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Secuencia de animaciones
    const animationSequence = Animated.sequence([
      // Fade in y scale del contenedor principal
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.back(1.2),
          useNativeDriver: true,
        }),
      ]),
      
      // Animación del logo
      Animated.timing(logoScaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
      
      // Rotación del círculo decorativo
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      
      // Slide up del texto
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    // Iniciar animaciones
    animationSequence.start();

    // Animación de los puntos de carga
    const pulseAnimation = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(dotAnim1, {
            toValue: 1.5,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim2, {
            toValue: 1.5,
            duration: 600,
            delay: 200,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim3, {
            toValue: 1.5,
            duration: 600,
            delay: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(dotAnim1, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim2, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim3, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => pulseAnimation());
    };

    // Iniciar animación de puntos después de 1.5 segundos
    setTimeout(pulseAnimation, 1500);

    // Navegar después de las animaciones
    const timeout = setTimeout(() => {
      navigation.replace('Login');
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [navigation, fadeAnim, scaleAnim, rotateAnim, slideAnim, logoScaleAnim, dotAnim1, dotAnim2, dotAnim3]);
  
  if (!fontsLoaded) return null;
  // Interpolación para la rotación
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      {/* Círculo decorativo animado */}
      <Animated.View 
        style={[
          styles.circle,
          {
            transform: [{ rotate: spin }]
          }
        ]} 
      />
      
      {/* Logo animado */}
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoScaleAnim }]
          }
        ]}
      >
        <View style={styles.logoIcon}>
          <Text style={styles.logoText}>🌴</Text>
        </View>
      </Animated.View>
      
      {/* Texto animado */}
      <Animated.View 
        style={[
          styles.textContainer,
          {
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.title}>TourSV</Text>
        <Text style={styles.subtitle}>Descubre El Salvador</Text>
      </Animated.View>
      
      {/* Indicador de carga animado */}
      <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
        <View style={styles.loadingDots}>
          <Animated.View style={[styles.dot, { transform: [{ scale: dotAnim1 }] }]} />
          <Animated.View style={[styles.dot, { transform: [{ scale: dotAnim2 }] }]} />
          <Animated.View style={[styles.dot, { transform: [{ scale: dotAnim3 }] }]} />
        </View>
      </Animated.View>
    </Animated.View>
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
  logoContainer: {
    position: 'absolute',
    top: height * 0.3,
    zIndex: 3,
    alignItems: 'center',
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2E5006',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 40,
  },
  textContainer: {
    zIndex: 2,
    alignItems: 'center',
    marginTop: height * 0.15,
  },
  title: {
    color: '#2E5006',
    fontSize: 32,
    fontFamily: 'Roboto_700Bold',
    textAlign: 'center',
    fontWeight: 'normal',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    color: '#A3B65A',
    fontSize: 16,
    fontFamily: 'Roboto_700Bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: height * 0.15,
    zIndex: 4,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A3B65A',
    marginHorizontal: 4,
  },
}); 