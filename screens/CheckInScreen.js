import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CheckInScreen({ navigation }) {
  const [room, setRoom] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    if (!room || !lastName) {
      Alert.alert('Falta info', 'Habitación y apellido');
      return;
    }
    setLoading(true);
    try {
      // 1. Guardar checkin en Firebase
      await addDoc(collection(db, 'checkins'), {
        room: String(room).trim(),
        lastName: lastName.trim(),
        status: 'llegó',
        hotelId: 'grand-velas',
        timestamp: serverTimestamp(),
      });

      // 2. Marcar habitación como ocupada
      await setDoc(doc(db, 'rooms', String(room).trim()), {
        number: String(room).trim(),
        status: 'ocupada',
        currentGuest: lastName.trim(),
        hotelId: 'grand-velas',
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // 3. FIX SEGURIDAD: Guardar sesión en el celular
      await AsyncStorage.setItem('guestRoom', String(room).trim());
      await AsyncStorage.setItem('guestName', lastName.trim());
      await AsyncStorage.setItem('checkInActive', 'true');

      Alert.alert('¡Bienvenido!', `Check-in Hab ${room} registrado. Ya puedes pedir room service.`, [
        { text: 'Ir al inicio', onPress: () => navigation.navigate('Home') }
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F8F6F0] p-6">
      <Text className="text-2xl font-bold text-[#003B5C] mt-10">Check-in Express</Text>
      <Text className="text-gray-500 mb-6">Solo huéspedes registrados pueden ordenar</Text>
      <Text className="text-sm font-bold mb-2">Habitación</Text>
      <TextInput value={room} onChangeText={setRoom} placeholder="Ej. 101" keyboardType="numeric" className="bg-white rounded-xl px-4 h-14 mb-4 border border-gray-200" />
      <Text className="text-sm font-bold mb-2">Apellido de reserva</Text>
      <TextInput value={lastName} onChangeText={setLastName} placeholder="Cortés" className="bg-white rounded-xl px-4 h-14 mb-8 border border-gray-200" />
      <TouchableOpacity onPress={handleCheckIn} disabled={loading} className="bg-[#003B5C] h-14 rounded-xl items-center justify-center">
        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Confirmar Check-in</Text>}
      </TouchableOpacity>
    </View>
  );
}
