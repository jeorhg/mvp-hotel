import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatScreen() {
  const [room, setRoom] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const flatListRef = useRef(null);

  useEffect(() => {
    let unsub = null;
    const init = async () => {
      const r = await AsyncStorage.getItem('guestRoom');
      const n = await AsyncStorage.getItem('guestName');
      const active = await AsyncStorage.getItem('checkInActive');
      if (!r || active !== 'true') {
        Alert.alert('Sin check-in', 'Haz check-in para chatear');
        return;
      }
      setRoom(r);
      setName(n || '');
      const q = query(collection(db, 'chats'), where('room', '==', String(r)));
      unsub = onSnapshot(q, snap => {
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        all.sort((a,b) => (a.timestamp?.seconds||0) - (b.timestamp?.seconds||0));
        setMessages(all);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      });
    };
    init();
    return () => { if (unsub) unsub(); };
  }, []);

  const sendMessage = async () => {
    if (!room || !message.trim()) return;
    try {
      await addDoc(collection(db, 'chats'), {
        room: String(room).trim(),
        guestName: name,
        text: message.trim(),
        sender: 'guest',
        timestamp: serverTimestamp(),
        hotelId: 'grand-velas'
      });
      setMessage('');
    } catch(e){ Alert.alert('Error', e.message); }
  };

  const logout = async () => {
    Alert.alert('Check-out', '¿Salir de habitación?', [
      { text: 'Cancelar' },
      { text: 'Salir', onPress: async () => { await AsyncStorage.clear(); setRoom(''); setMessages([]); Alert.alert('Check-out hecho'); } }
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white">
      <View className="bg-[#003B5C] pt-12 pb-4 px-6 flex-row justify-between items-center">
        <View><Text className="text-white text-xl font-bold">Concierge</Text><Text className="text-white/70 text-xs">Hab {room || '--'} • {name}</Text></View>
        <TouchableOpacity onPress={logout} className="bg-white/20 px-3 py-1 rounded-full"><Text className="text-white text-xs">Salir</Text></TouchableOpacity>
      </View>
      <FlatList ref={flatListRef} data={messages} keyExtractor={i => i.id} contentContainerStyle={{ padding: 16 }} renderItem={({ item }) => (
        <View className={`my-1 max-w-[80%] px-4 py-3 rounded-2xl ${item.sender === 'guest' ? 'bg-[#003B5C] self-end rounded-br-sm' : 'bg-gray-200 self-start rounded-bl-sm'}`}><Text className={`${item.sender === 'guest' ? 'text-white' : 'text-gray-800'}`}>{item.text}</Text><Text className={`text-[10px] mt-1 ${item.sender === 'guest' ? 'text-white/60' : 'text-gray-500'}`}>{item.sender === 'guest' ? 'Tú' : 'Recepción'}</Text></View>
      )} ListEmptyComponent={<View className="items-center mt-20"><Text className="text-gray-400">Chat de Hab {room}</Text></View>} />
      <View className="p-3 border-t border-gray-200 flex-row"><TextInput value={message} onChangeText={setMessage} placeholder="Escribe..." className="flex-1 bg-gray-100 rounded-full px-5 py-3 mr-3" onSubmitEditing={sendMessage} /><TouchableOpacity onPress={sendMessage} className="bg-[#003B5C] w-12 h-12 rounded-full items-center justify-center"><Text className="text-white font-bold">➤</Text></TouchableOpacity></View>
    </KeyboardAvoidingView>
  );
}
