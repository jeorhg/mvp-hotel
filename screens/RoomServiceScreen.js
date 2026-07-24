import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RoomServiceScreen({ navigation }) {
  const [guestRoom, setGuestRoom] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
    const unsub = onSnapshot(collection(db, 'menu'), snap => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => i.disponible !== false);
      if (items.length > 0) setMenu(items);
      else setMenu([
        { id: '1', name: 'Tacos de Rib Eye', price: 450, desc: '3 pzas con guacamole y tortillas hechas a mano', category: 'Demo', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500' },
        { id: '2', name: 'Guacamole Tradicional', price: 280, desc: 'Con totopos y chapulines', category: 'Demo', image: 'https://images.unsplash.com/photo-1511690656952-a0c5a7726f5b?w=500' },
      ]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const checkSession = async () => {
    const room = await AsyncStorage.getItem('guestRoom');
    const name = await AsyncStorage.getItem('guestName');
    const active = await AsyncStorage.getItem('checkInActive');
    if (!room || active !== 'true') {
      Alert.alert('Sin check-in', 'Debes hacer check-in primero', [
        { text: 'Hacer Check-in', onPress: () => navigation.navigate('CheckIn') }
      ]);
      return;
    }
    setGuestRoom(room);
    setGuestName(name);
  };

  const addToCart = (item) => setCart(prev => [...prev, item]);
  const total = cart.reduce((s,i) => s + (i.price||0), 0);

  const placeOrder = async () => {
    if (!guestRoom) return;
    if (cart.length === 0) { Alert.alert('Carrito vacío'); return; }
    try {
      await addDoc(collection(db, 'orders'), {
        room: String(guestRoom),
        guestName,
        items: cart,
        total,
        status: 'nuevo',
        hotelId: 'grand-velas',
        timestamp: serverTimestamp(),
      });
      Alert.alert('¡Pedido enviado!', `Hab ${guestRoom} - $${total}`, [{ text: 'OK', onPress: () => { setCart([]); navigation.navigate('Home'); } }]);
    } catch(e){ Alert.alert('Error', e.message); }
  };

  if (loading) return <View className="flex-1 items-center justify-center"><ActivityIndicator /></View>;

  return (
    <View className="flex-1 bg-white">
      <View className="bg-[#0A3D4A] p-4 pt-14 flex-row justify-between items-center">
        <View><Text className="text-white font-bold text-lg">Room Service</Text><Text className="text-white/70 text-xs">Habitación {guestRoom || '--'} {guestName ? `• ${guestName}` : ''}</Text></View>
        <View className="bg-white/20 px-3 py-1 rounded-full"><Text className="text-white font-bold">${total}</Text></View>
      </View>
      <ScrollView className="flex-1 bg-[#F5F5F5] p-4">
        {menu.map(item => (
          <View key={item.id} className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm border border-gray-100">
            {item.image ? <Image source={{ uri: item.image }} className="w-full h-48 bg-gray-200" resizeMode="cover" /> : null}
            <View className="p-4">
              <Text className="font-bold text-[16px] text-[#0A3D4A]">{item.name}</Text>
              <Text className="text-xs text-gray-500 mt-1">{item.desc || item.category}</Text>
              <View className="flex-row justify-between items-center mt-3">
                <Text className="font-bold text-[#0A3D4A] text-lg">${item.price}</Text>
                <TouchableOpacity onPress={() => addToCart(item)} className="bg-[#0A3D4A] px-6 py-2.5 rounded-full"><Text className="text-white font-bold text-sm">Agregar</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      <View className="p-4 border-t border-gray-200 bg-white">
        <Text className="text-sm mb-2 text-gray-600">{cart.length} items • Total ${total} MXN</Text>
        <TouchableOpacity onPress={placeOrder} className="bg-[#0A3D4A] h-12 rounded-xl items-center justify-center"><Text className="text-white font-bold">Enviar a cocina - Hab {guestRoom}</Text></TouchableOpacity>
      </View>
    </View>
  );
}
