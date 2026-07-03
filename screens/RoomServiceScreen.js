import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { styled } from 'nativewind';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledButton = styled(TouchableOpacity);

// Menú de ejemplo - esto después viene de Firebase
const MENU = [
  {
    id: '1',
    name: 'Tacos de Rib Eye',
    desc: '3 pzas con guacamole y tortillas hechas a mano',
    price: 450,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500',
    category: 'Plato Fuerte'
  },
  {
    id: '2', 
    name: 'Guacamole Tradicional',
    desc: 'Con totopos y chapulines',
    price: 280,
    image: 'https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?w=500',
    category: 'Entradas'
  },
  {
    id: '3',
    name: 'Margarita de la Casa',
    desc: 'Tequila 100% agave, limón y sal',
    price: 220,
    image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500',
    category: 'Bebidas'
  },
];

export default function RoomServiceScreen() {
  const [cart, setCart] = useState([]);
  const [room, setRoom] = useState('1245'); // Esto vendría del login/check-in

  const addToCart = (item) => {
    setCart([...cart, item]);
    Alert.alert('Agregado', `${item.name} se agregó a tu pedido`);
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price, 0);
  };

  const sendOrder = async () => {
    if (cart.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega algo al pedido primero');
      return;
    }

    const order = {
      room,
      items: cart,
      total: getTotal(),
      status: 'nuevo',
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'orders'), order);
      Alert.alert(
        '¡Pedido enviado!',
        `Total: $${getTotal()} MXN\nLlegará a tu habitación ${room} en 25-35 min.`
      );
      setCart([]);
    } catch (error) {
      console.error('Error al enviar el pedido:', error);
      Alert.alert('Error', 'No se pudo enviar el pedido. Intenta de nuevo.');
    }
  };

  const renderItem = ({ item }) => (
    <StyledView className="bg-white rounded-2xl mb-4 shadow-sm">
      <Image 
        source={{ uri: item.image }} 
        className="w-full h-40 rounded-t-2xl"
      />
      <StyledView className="p-4">
        <StyledText className="text-lg font-bold text-gray-800">{item.name}</StyledText>
        <StyledText className="text-sm text-gray-500 mb-2">{item.desc}</StyledText>
        <StyledView className="flex-row justify-between items-center">
          <StyledText className="text-xl font-bold text-[#003B5C]">${item.price}</StyledText>
          <StyledButton 
            className="bg-[#003B5C] px-6 py-2 rounded-lg"
            onPress={() => addToCart(item)}
          >
            <StyledText className="text-white font-semibold">Agregar</StyledText>
          </StyledButton>
        </StyledView>
      </StyledView>
    </StyledView>
  );

  return (
    <StyledView className="flex-1 bg-gray-50">
      <StyledView className="bg-[#003B5C] pt-12 pb-4 px-6">
        <StyledText className="text-white text-2xl font-bold">Room Service</StyledText>
        <StyledText className="text-white/80">Habitación {room}</StyledText>
      </StyledView>

      <FlatList
        data={MENU}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
      />

      {cart.length > 0 && (
        <StyledView className="bg-white p-4 border-t border-gray-200">
          <StyledView className="flex-row justify-between mb-3">
            <StyledText className="text-lg text-gray-600">Total:</StyledText>
            <StyledText className="text-2xl font-bold text-[#003B5C]">
              ${getTotal()} MXN
            </StyledText>
          </StyledView>
          <StyledButton 
            className="bg-green-600 h-14 rounded-xl items-center justify-center"
            onPress={sendOrder}
          >
            <StyledText className="text-white font-bold text-lg">
              Enviar pedido • {cart.length} items
            </StyledText>
          </StyledButton>
        </StyledView>
      )}
    </StyledView>
  );
}