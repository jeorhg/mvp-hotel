import './global.css';
import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import CheckInScreen from './screens/CheckInScreen';
import RoomServiceScreen from './screens/RoomServiceScreen';
import PanelRecepcion from './screens/PanelRecepcion';
import ChatScreen from './screens/ChatScreen';
import AdminMenu from './screens/AdminMenu';
import AdminHabitaciones from './screens/AdminHabitaciones';

const Stack = createNativeStackNavigator();
const ADMIN_PIN = '2025';

function HomeScreen({ navigation }) {
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pressCount, setPressCount] = useState(0);
  const handleLogoPress = () => {
    const newCount = pressCount + 1;
    setPressCount(newCount);
    if (newCount >= 5) { setShowPinModal(true); setPressCount(0); }
  };
  const handlePinSubmit = () => {
    if (pin === ADMIN_PIN) { setShowPinModal(false); setPin(''); navigation.navigate('Panel'); }
    else { Alert.alert('PIN incorrecto'); setPin(''); }
  };
  return (
    <View className="flex-1 bg-[#F8F6F0] items-center justify-center p-6">
      <TouchableOpacity activeOpacity={0.8} onPress={handleLogoPress} className="items-center">
        <Text className="text-3xl font-bold text-[#003B5C] mb-1">Grand Velas</Text>
        <Text className="text-xs text-[#D4AF37] tracking-[4px] mb-2">RIVIERA MAYA</Text>
        <Text className="text-[10px] text-gray-400">5 taps = staff</Text>
      </TouchableOpacity>
      <View className="w-full mt-10">
        <TouchableOpacity className="w-full bg-[#003B5C] h-14 rounded-xl items-center justify-center mb-3" onPress={() => navigation.navigate('CheckIn')}><Text className="text-white font-bold">Check-in Express</Text></TouchableOpacity>
        <TouchableOpacity className="w-full bg-white border border-[#003B5C]/20 h-14 rounded-xl items-center justify-center mb-3" onPress={() => navigation.navigate('RoomService')}><Text className="text-[#003B5C] font-bold">Room Service</Text></TouchableOpacity>
        <TouchableOpacity className="w-full bg-white border border-[#003B5C]/20 h-14 rounded-xl items-center justify-center" onPress={() => navigation.navigate('Chat')}><Text className="text-[#003B5C] font-bold">Chat Concierge</Text></TouchableOpacity>
      </View>
      <Modal visible={showPinModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center p-6">
          <View className="bg-white w-full rounded-2xl p-6">
            <Text className="text-xl font-bold text-[#003B5C] mb-2">Acceso Staff PIN 2025</Text>
            <TextInput value={pin} onChangeText={setPin} placeholder="2025" keyboardType="numeric" secureTextEntry className="bg-gray-100 rounded-xl px-4 h-14 text-center text-lg tracking-[8px] mb-4" autoFocus />
            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => { setShowPinModal(false); setPin(''); }} className="flex-1 h-12 rounded-xl bg-gray-100 items-center justify-center"><Text className="font-semibold">Cancelar</Text></TouchableOpacity>
              <TouchableOpacity onPress={handlePinSubmit} className="flex-1 h-12 rounded-xl bg-[#003B5C] items-center justify-center"><Text className="font-bold text-white">Entrar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#003B5C' }, headerTintColor: '#fff' }}>
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CheckIn" component={CheckInScreen} options={{ title: 'Check-in' }} />
        <Stack.Screen name="RoomService" component={RoomServiceScreen} options={{ title: 'Room Service' }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
        <Stack.Screen name="Panel" component={PanelRecepcion} options={{ title: 'Panel ADMIN' }} />
        <Stack.Screen name="AdminMenu" component={AdminMenu} options={{ title: 'Admin • Menú' }} />
        <Stack.Screen name="AdminHabitaciones" component={AdminHabitaciones} options={{ title: 'Admin • Habitaciones' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
