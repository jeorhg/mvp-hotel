import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { styled } from 'nativewind';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledInput = styled(TextInput);
const StyledButton = styled(TouchableOpacity);

export default function CheckInScreen() {
  const [room, setRoom] = useState('');
  const [lastName, setLastName] = useState('');

  const handleCheckIn = async () => {
    if (!room || !lastName) {
      Alert.alert('Datos incompletos', 'Ingresa tu número de habitación y apellido');
      return;
    }

    const checkIn = {
      room,
      lastName,
      status: 'llegó',
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'checkins'), checkIn);
      Alert.alert(
        '¡Bienvenido a Grand Velas!',
        `Habitación ${room}, hemos notificado a recepción tu llegada. Tu concierge asignado te contactará en 5 min.`
      );
      setRoom('');
      setLastName('');
    } catch (error) {
      console.error('Error al registrar el check-in:', error);
      Alert.alert('Error', 'No se pudo enviar la información. Intenta de nuevo.');
    }
  };

  return (
    <StyledView className="flex-1 bg-white items-center px-6 pt-12">
      <Image 
        source={{ uri: 'https://www.velasresorts.com.mx/images/logos/grand-velas-logo.png' }} 
        className="w-48 h-16 mb-8"
        resizeMode="contain"
      />
      
      <StyledText className="text-2xl font-bold text-gray-800 mb-2">
        Check-in Express
      </StyledText>
      <StyledText className="text-base text-gray-500 mb-8 text-center">
        Evita filas. Notifica tu llegada y nosotros preparamos todo.
      </StyledText>

      <StyledInput
        className="w-full h-14 bg-gray-100 rounded-xl px-4 mb-4 text-base"
        placeholder="Número de habitación"
        keyboardType="numeric"
        value={room}
        onChangeText={setRoom}
      />
      
      <StyledInput
        className="w-full h-14 bg-gray-100 rounded-xl px-4 mb-6 text-base"
        placeholder="Apellido de la reservación"
        value={lastName}
        onChangeText={setLastName}
      />

      <StyledButton 
        className="w-full h-14 bg-[#003B5C] rounded-xl items-center justify-center"
        onPress={handleCheckIn}
      >
        <StyledText className="text-white font-bold text-lg">
          Notificar mi llegada
        </StyledText>
      </StyledButton>

      <StyledText className="text-xs text-gray-400 mt-8 text-center">
        ¿Problemas? Llama a recepción: 984-877-4400
      </StyledText>
    </StyledView>
  );
}