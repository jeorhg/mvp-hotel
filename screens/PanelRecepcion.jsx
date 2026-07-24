import { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export default function PanelRecepcion({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [reply, setReply] = useState('');
  const [tab, setTab] = useState('chats');

  useEffect(() => {
    const qOrders = query(collection(db, 'orders'), where('status', '==', 'nuevo'));
    const unsubOrders = onSnapshot(qOrders, snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const qCheckins = query(collection(db, 'checkins'), where('status', '==', 'llegó'));
    const unsubCheckins = onSnapshot(qCheckins, snap => setCheckins(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    // FIX: sin orderBy para evitar necesitar indice
    const unsubChats = onSnapshot(collection(db, 'chats'), snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      all.sort((a,b) => (a.timestamp?.seconds||0) - (b.timestamp?.seconds||0));
      setChats(all);
      if (!selectedRoom && all.length > 0) setSelectedRoom(String(all[all.length - 1].room));
    });

    return () => { unsubOrders(); unsubCheckins(); unsubChats(); };
  }, []);

  const roomsWithChats = [...new Set(chats.map(c => String(c.room)))];
  const filteredChats = chats.filter(c => String(c.room) === String(selectedRoom));

  const marcarAtendido = async (id, col) => { try { await updateDoc(doc(db, col, id), { status: 'atendido' }); } catch(e){} };

  const responderChat = async () => {
    if (!reply.trim() || !selectedRoom) return;
    try {
      await addDoc(collection(db, 'chats'), {
        room: String(selectedRoom).trim(), // FIX: siempre string
        text: reply.trim(),
        sender: 'staff',
        timestamp: serverTimestamp(),
        hotelId: 'grand-velas'
      });
      setReply('');
    } catch(e){ Alert.alert('Error', e.message); }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="bg-[#003B5C] pt-12 pb-3 px-4">
        <Text className="text-white text-xl font-bold">Panel Recepción - Grand Velas</Text>
        <Text className="text-white/60 text-xs">Admin • {chats.length} mensajes totales</Text>
      </View>
      <View className="flex-row gap-2 p-3 bg-gray-50">
        <TouchableOpacity onPress={() => navigation.navigate('AdminMenu')} className="flex-1 bg-white border border-[#003B5C] py-3 rounded-xl items-center"><Text className="font-bold text-[#003B5C] text-xs">🍽 Menú</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AdminHabitaciones')} className="flex-1 bg-white border border-[#003B5C] py-3 rounded-xl items-center"><Text className="font-bold text-[#003B5C] text-xs">🛏 Habs</Text></TouchableOpacity>
      </View>
      <View className="flex-row border-b border-gray-200">
        {[{ id: 'chats', label: `Chats (${roomsWithChats.length})` },{ id: 'orders', label: `Pedidos (${orders.length})` },{ id: 'checkins', label: `Check-ins (${checkins.length})` }].map(t => (
          <TouchableOpacity key={t.id} onPress={() => setTab(t.id)} className={`flex-1 py-3 items-center ${tab === t.id ? 'border-b-2 border-[#003B5C]' : ''}`}><Text className={`${tab === t.id ? 'font-bold text-[#003B5C]' : 'text-gray-500'} text-sm`}>{t.label}</Text></TouchableOpacity>
        ))}
      </View>
      {tab === 'chats' && (
        <View className="flex-1 flex-row">
          <View className="w-28 border-r border-gray-200 bg-gray-50">
            <ScrollView>{roomsWithChats.length === 0 ? <Text className="text-xs text-gray-400 p-3">Sin chats</Text> : roomsWithChats.map(r => (
              <TouchableOpacity key={r} onPress={() => setSelectedRoom(r)} className={`p-3 border-b border-gray-100 ${String(selectedRoom)===String(r) ? 'bg-white' : ''}`}><Text className={`font-bold ${String(selectedRoom)===String(r) ? 'text-[#003B5C]' : 'text-gray-700'}`}>Hab {r}</Text><Text className="text-[10px] text-gray-500">{chats.filter(c => String(c.room)===String(r)).length} msgs</Text></TouchableOpacity>
            ))}</ScrollView>
          </View>
          <View className="flex-1">
            {!selectedRoom ? <View className="flex-1 items-center justify-center p-6"><Text className="text-gray-400">Selecciona hab</Text></View> : (
              <>
                <FlatList data={filteredChats} keyExtractor={item => item.id} contentContainerStyle={{ padding: 12 }} renderItem={({ item }) => (
                  <View className={`my-1 max-w-[85%] px-3 py-2 rounded-xl ${item.sender === 'guest' ? 'bg-gray-200 self-start' : 'bg-[#003B5C] self-end'}`}><Text className={`${item.sender === 'guest' ? 'text-gray-800' : 'text-white'} text-sm`}>{item.text}</Text><Text className="text-[9px] text-gray-400 mt-1">{item.sender}</Text></View>
                )} />
                <View className="p-2 border-t border-gray-200 flex-row"><TextInput value={reply} onChangeText={setReply} placeholder={`Responder a ${selectedRoom}...`} className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2 text-sm" /><TouchableOpacity onPress={responderChat} className="bg-[#003B5C] px-5 rounded-full items-center justify-center"><Text className="text-white font-bold">Enviar</Text></TouchableOpacity></View>
              </>
            )}
          </View>
        </View>
      )}
      {tab === 'orders' && (<ScrollView className="flex-1 p-4">{orders.length === 0 ? <Text>No hay pedidos</Text> : orders.map(o => (<View key={o.id} className="border p-4 mb-3 rounded-xl bg-gray-50"><Text className="font-bold">Hab {o.room} - ${o.total}</Text><TouchableOpacity onPress={() => marcarAtendido(o.id, 'orders')} className="mt-2 bg-[#003B5C] py-2 rounded-lg items-center"><Text className="text-white font-bold text-sm">Atendido ✓</Text></TouchableOpacity></View>))}</ScrollView>)}
      {tab === 'checkins' && (<ScrollView className="flex-1 p-4">{checkins.length === 0 ? <Text>No hay check-ins</Text> : checkins.map(c => (<View key={c.id} className="border p-4 mb-3 rounded-xl bg-blue-50"><Text className="font-bold">Hab {c.room} - {c.lastName}</Text><TouchableOpacity onPress={() => marcarAtendido(c.id, 'checkins')} className="mt-2 bg-blue-600 py-2 rounded-lg items-center"><Text className="text-white font-bold text-sm">Atendido ✓</Text></TouchableOpacity></View>))}</ScrollView>)}
    </View>
  );
}
