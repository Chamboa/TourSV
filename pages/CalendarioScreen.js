import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, TextInput, Image, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEvents, createEvent, deleteEvent } from './api';

const { width, height } = Dimensions.get('window');
const userImg = 'https://randomuser.me/api/portraits/women/44.jpg';
const CARD_SIZE = width * 0.42;

const diasSemana = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function getCalendarMatrix(month, year) {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Domingo
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  let matrix = [];
  let day = 1;
  let started = false;
  for (let i = 0; i < 6; i++) {
    let week = [];
    for (let j = 0; j < 7; j++) {
      let cell = 0;
      // Ajustar para que Lunes sea el primer día (en ES: 1=Lunes, 0=Domingo)
      let weekDay = (j + 1) % 7;
      if (!started && weekDay === (firstDay === 0 ? 6 : firstDay - 1)) started = true;
      if (started && day <= daysInMonth) {
        cell = day;
        day++;
      }
      week.push(cell);
    }
    matrix.push(week);
    if (day > daysInMonth) break;
  }
  // Rellenar días previos y siguientes
  const firstWeek = matrix[0];
  let prev = daysInPrevMonth;
  for (let i = 0; i < 7; i++) {
    if (firstWeek[i] === 0) {
      firstWeek[i] = prev - firstWeek.slice(0, i).filter(x => x === 0).length + 1;
    }
  }
  const lastWeek = matrix[matrix.length - 1];
  let next = 1;
  for (let i = 0; i < 7; i++) {
    if (lastWeek[i] === 0) {
      lastWeek[i] = next++;
    }
  }
  return matrix;
}

const evento = {
  nombre: 'Sunset Park',
  dept: 'La Libertad',
  img: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/3e/2e/7b/sunset-park.jpg?w=700&h=-1&s=1',
  rating: 5.0,
};

const CalendarioScreen = () => {
  const navigation = useNavigation();
  const today = new Date();
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    (async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const { id } = JSON.parse(user);
        setUserId(id);
        setIsLoading(true);
        const evs = await getEvents(id);
        setEvents(evs);
        setIsLoading(false);
      }
    })();
  }, []);

  const handleAddEvent = async () => {
    if (!userId) return;
    const date = new Date(year, month, selectedDay);
    const title = search.trim() || 'Evento sin título';
    setIsLoading(true);
    const ev = await createEvent({ title, date, userId });
    setEvents([...events, ev]);
    setIsLoading(false);
    Alert.alert('Evento creado');
  };

  const handleDeleteEvent = async (id) => {
    setIsLoading(true);
    await deleteEvent(id);
    setEvents(events.filter(e => e._id !== id));
    setIsLoading(false);
    Alert.alert('Evento eliminado');
  };

  const matrix = getCalendarMatrix(month, year);

  const handlePrevMonth = () => {
    setIsLoading(true);
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
    setSelectedDay(1);
    setTimeout(() => setIsLoading(false), 1000);
  };
  const handleNextMonth = () => {
    setIsLoading(true);
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
    setSelectedDay(1);
    setTimeout(() => setIsLoading(false), 1000);
  };
  const handleSearch = (text) => {
    setIsLoading(true);
    setSearch(text);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const eventoVisible = evento.nombre.toLowerCase().includes(search.toLowerCase());

  // Mostrar eventos del día seleccionado
  const dateStr = new Date(year, month, selectedDay).toISOString().slice(0, 10);
  const eventosDelDia = events.filter(e => e.date && e.date.slice(0, 10) === dateStr);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => navigation.navigate('Perfil')}>
          <Image source={{ uri: userImg }} style={styles.avatar} />
        </TouchableOpacity>
      </View>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={width * 0.06} color="#888" style={{ marginLeft: width * 0.025 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar"
          placeholderTextColor="#888"
          value={search}
          onChangeText={handleSearch}
        />
        <TouchableOpacity>
          <Feather name="menu" size={width * 0.07} color="#000" style={{ marginRight: width * 0.025 }} />
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <>
          {/* Calendario real */}
          <View style={styles.calendarBox}>
            <View style={styles.calendarHeaderRow}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.monthArrow}><Ionicons name="chevron-back" size={width*0.07} color="#222" /></TouchableOpacity>
              <Text style={styles.calendarMonth}>{meses[month]} {year}</Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.monthArrow}><Ionicons name="chevron-forward" size={width*0.07} color="#222" /></TouchableOpacity>
            </View>
            <View style={styles.calendarRow}>
              {diasSemana.map((d, i) => (
                <Text key={i} style={styles.calendarDayName}>{d}</Text>
              ))}
            </View>
            {matrix.map((semana, i) => (
              <View key={i} style={styles.calendarRow}>
                {semana.map((dia, j) => {
                  let isCurrentMonth = false;
                  if (i === 0 && dia > 7) isCurrentMonth = false;
                  else if (i === matrix.length - 1 && dia < 7) isCurrentMonth = false;
                  else isCurrentMonth = true;
                  return (
                    <TouchableOpacity
                      key={j}
                      style={[
                        styles.calendarDay,
                        isCurrentMonth && dia === selectedDay && styles.calendarDaySelected,
                        !isCurrentMonth && { opacity: 0.3 },
                      ]}
                      onPress={() => isCurrentMonth && setSelectedDay(dia)}
                      disabled={!isCurrentMonth}
                    >
                      <Text style={isCurrentMonth && dia === selectedDay ? styles.calendarDayTextSelected : styles.calendarDayText}>{dia}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
          {/* Card de evento/lugar */}
          {eventoVisible && (
            <View style={styles.card}>
              <Image source={{ uri: evento.img }} style={styles.cardImg} />
              <View style={styles.cardOverlay} />
              <View style={styles.cardContent}>
                <Text style={styles.cardDept}>{evento.dept}</Text>
                <Text style={styles.cardTitle}>{evento.nombre}</Text>
                <View style={styles.cardRatingRow}>
                  <MaterialIcons name="star" size={width * 0.04} color="#fff" />
                  <Text style={styles.cardRating}>{evento.rating}</Text>
                </View>
                <TouchableOpacity style={styles.cardDetailsBtn}>
                  <Text style={styles.cardDetailsText}>Más detalles</Text>
                  <Ionicons name="chevron-forward" size={width * 0.04} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* Card de eventos del día */}
          {eventosDelDia.length > 0 ? (
            eventosDelDia.map(ev => (
              <View style={styles.card} key={ev._id}>
                <View style={styles.cardOverlay} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{ev.title}</Text>
                  <Text style={styles.cardDept}>{new Date(ev.date).toLocaleDateString()}</Text>
                  <TouchableOpacity style={styles.cardDetailsBtn} onPress={() => handleDeleteEvent(ev._id)}>
                    <Text style={styles.cardDetailsText}>Eliminar</Text>
                    <Ionicons name="trash" size={width * 0.04} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ color: '#888', fontSize: width * 0.045, textAlign: 'center', marginTop: 20 }}>No hay eventos para este día.</Text>
          )}
          {/* Botón para agregar evento */}
          <TouchableOpacity style={[styles.cardDetailsBtn, { alignSelf: 'center', marginTop: 16 }]} onPress={handleAddEvent}>
            <Text style={styles.cardDetailsText}>Agregar evento</Text>
            <Ionicons name="add" size={width * 0.04} color="#fff" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: height * 0.045,
    marginBottom: height * 0.02,
    paddingHorizontal: width * 0.06,
  },
  avatar: {
    width: width * 0.13,
    height: width * 0.13,
    borderRadius: (width * 0.13) / 2,
    backgroundColor: '#ccc',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: width * 0.06,
    marginHorizontal: width * 0.06,
    marginBottom: height * 0.022,
    height: height * 0.06,
    shadowColor: 'transparent',
  },
  searchInput: {
    flex: 1,
    fontSize: width * 0.04,
    fontFamily: 'Roboto_400Regular',
    color: '#222',
    marginLeft: width * 0.02,
    backgroundColor: 'transparent',
  },
  calendarBox: {
    backgroundColor: '#F3F3F3',
    borderRadius: width * 0.06,
    marginHorizontal: width * 0.04,
    marginBottom: width * 0.06,
    padding: width * 0.045,
    alignItems: 'center',
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 6,
  },
  monthArrow: {
    padding: 6,
    borderRadius: 16,
  },
  calendarMonth: {
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.055,
    color: '#222',
    marginBottom: 8,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  calendarDayName: {
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.045,
    color: '#222',
    width: width * 0.09,
    textAlign: 'center',
  },
  calendarDay: {
    width: width * 0.09,
    height: width * 0.09,
    borderRadius: width * 0.045,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  calendarDaySelected: {
    backgroundColor: '#72BCBF',
  },
  calendarDayText: {
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.045,
    color: '#222',
  },
  calendarDayTextSelected: {
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.045,
    color: '#fff',
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE * 1.18,
    borderRadius: width * 0.07,
    overflow: 'hidden',
    backgroundColor: '#ccc',
    marginBottom: width * 0.045,
    alignSelf: 'center',
  },
  cardImg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  cardContent: {
    position: 'absolute',
    left: width * 0.045,
    bottom: width * 0.045,
  },
  cardDept: {
    color: '#fff',
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.038,
    marginBottom: 2,
  },
  cardTitle: {
    color: '#fff',
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.052,
    marginBottom: 8,
  },
  cardRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardRating: {
    color: '#fff',
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.038,
    marginLeft: 4,
  },
  cardDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  cardDetailsText: {
    color: '#fff',
    fontFamily: 'Roboto_400Regular',
    fontSize: width * 0.038,
    marginRight: 2,
  },
});

export default CalendarioScreen; 