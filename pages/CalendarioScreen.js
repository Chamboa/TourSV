import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, TextInput, Image, FlatList, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEvents, createEvent, deleteEvent } from './api';
import PromocionesClienteScreen from './PromocionesClienteScreen';
import ReservacionesClienteScreen from './ReservacionesClienteScreen';

const { width, height } = Dimensions.get('window');
const userImg = 'https://randomuser.me/api/portraits/women/44.jpg';
const CARD_SIZE = width * 0.42;

const diasSemana = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function getCalendarMatrix(month, year) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  let matrix = [];
  let day = 1;
  let started = false;
  for (let i = 0; i < 6; i++) {
    let week = [];
    for (let j = 0; j < 7; j++) {
      let cell = 0;
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
  const [activeTab, setActiveTab] = useState('calendario');

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

  const dateStr = new Date(year, month, selectedDay).toISOString().slice(0, 10);
  const eventosDelDia = events.filter(e => e.date && e.date.slice(0, 10) === dateStr);

  const renderCalendario = () => (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.calendarBox}>
        <View style={styles.calendarHeaderRow}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.monthArrow}>
            <Ionicons name="chevron-back" size={width*0.07} color="#222" />
          </TouchableOpacity>
          <Text style={styles.calendarMonth}>{meses[month]} {year}</Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.monthArrow}>
            <Ionicons name="chevron-forward" size={width*0.07} color="#222" />
          </TouchableOpacity>
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
                  <Text style={[
                    styles.calendarDayText,
                    isCurrentMonth && dia === selectedDay && styles.calendarDayTextSelected,
                  ]}>
                    {dia}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Eventos del día */}
      <View style={styles.eventsContainer}>
        <Text style={styles.eventsTitle}>Eventos del {selectedDay} de {meses[month]}</Text>
        {eventosDelDia.length > 0 ? (
          eventosDelDia.map(ev => (
            <View style={styles.eventCard} key={ev._id}>
              <Text style={styles.eventTitle}>{ev.title}</Text>
              <Text style={styles.eventDate}>{new Date(ev.date).toLocaleDateString()}</Text>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteEvent(ev._id)}>
                <Ionicons name="trash" size={20} color="#E17055" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noEventsText}>No hay eventos para este día.</Text>
        )}
        <TouchableOpacity style={styles.addEventBtn} onPress={handleAddEvent}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addEventText}>Agregar evento</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

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

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'calendario' && styles.activeTab]} 
          onPress={() => setActiveTab('calendario')}
        >
          <Ionicons name="calendar" size={20} color={activeTab === 'calendario' ? '#2E5006' : '#888'} />
          <Text style={[styles.tabText, activeTab === 'calendario' && styles.activeTabText]}>Calendario</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'promociones' && styles.activeTab]} 
          onPress={() => setActiveTab('promociones')}
        >
          <Ionicons name="pricetags" size={20} color={activeTab === 'promociones' ? '#2E5006' : '#888'} />
          <Text style={[styles.tabText, activeTab === 'promociones' && styles.activeTabText]}>Promociones</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'reservaciones' && styles.activeTab]} 
          onPress={() => setActiveTab('reservaciones')}
        >
          <Ionicons name="bookmark" size={20} color={activeTab === 'reservaciones' ? '#2E5006' : '#888'} />
          <Text style={[styles.tabText, activeTab === 'reservaciones' && styles.activeTabText]}>Reservaciones</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E5006" />
        </View>
      ) : (
        <>
          {activeTab === 'calendario' && renderCalendario()}
          {activeTab === 'promociones' && <PromocionesClienteScreen />}
          {activeTab === 'reservaciones' && <ReservacionesClienteScreen />}
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: width * 0.06,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#E8F5E9',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#2E5006',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  eventsContainer: {
    marginHorizontal: width * 0.06,
    marginBottom: 20,
  },
  eventsTitle: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 18,
    color: '#222',
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventTitle: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 16,
    color: '#222',
    flex: 1,
  },
  eventDate: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    color: '#888',
    marginRight: 12,
  },
  deleteBtn: {
    padding: 8,
  },
  noEventsText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Roboto_400Regular',
  },
  addEventBtn: {
    backgroundColor: '#2E5006',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  addEventText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CalendarioScreen; 