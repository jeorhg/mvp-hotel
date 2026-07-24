import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, Modal } from 'react-native';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const TYPES = ['Estándar', 'Deluxe', 'Suite', 'Presidencial'];
const STATUS = ['libre', 'ocupada', 'limpieza', 'mantenimiento'];

export default function AdminHabitaciones() {
  const [rooms, setRooms] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ number: '', type: 'Estándar', status: 'libre', piso: '1' });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'rooms'), snap => {
      setRooms(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => Number(a.number)-Number(b.number)));
    });
    return () => unsub();
  }, []);

  const openNew = () => { setEditing(null); setForm({ number: '', type: 'Estándar', status: 'libre', piso: '1' }); setModalVisible(true); };
  const openEdit = (r) => { setEditing(r); setForm({ ...r, number: String(r.number) }); setModalVisible(true); };

  const save = async () => {
    if (!form.number) { Alert.alert('Falta número'); return; }
    const data = { ...form, number: form.number, updatedAt: serverTimestamp(), hotelId: 'grand-velas' };
    try {
      if (editing) await updateDoc(doc(db, 'rooms', editing.id), data);
      else await addDoc(collection(db, 'rooms'), { ...data, createdAt: serverTimestamp() });
      setModalVisible(false);
    } catch(e){ Alert.alert('Error', e.message); }
  };

  const remove = (id) => {
    Alert.alert('Borrar habitación', '¿Seguro?', [
      { text: 'Cancelar' },
      { text: 'Borrar', style: 'destructive', onPress: async () => await deleteDoc(doc(db, 'rooms', id)) }
    ]);
  };

  const statusColor = (s) => ({ libre: 'bg-green-100 text-green-700', ocupada: 'bg-red-100 text-red-700', limpieza: 'bg-yellow-100 text-yellow-700', mantenimiento: 'bg-gray-200 text-gray-700' }[s] || 'bg-gray-100');

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 flex-row justify-between items-center border-b border-gray-100">
        <Text className="font-bold text-lg">Habitaciones ({rooms.length})</Text>
        <TouchableOpacity onPress={openNew} className="bg-[#003B5C] px-4 py-2 rounded-full"><Text className="text-white font-bold">+ Nueva hab</Text></TouchableOpacity>
      </View>

      <View className="flex-row p-3 gap-2">
        {STATUS.map(s => (
          <View key={s} className="flex-row items-center gap-1"><View className={`w-2 h-2 rounded-full ${statusColor(s).split(' ')[0]}`} /><Text className="text-[10px] text-gray-600">{s} {rooms.filter(r => r.status===s).length}</Text></View>
        ))}
      </View>

      <FlatList
        data={rooms}
        keyExtractor={i => i.id}
        numColumns={2}
        contentContainerStyle={{ padding: 12, gap: 12 }}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <View className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <Text className="text-2xl font-bold text-[#003B5C]">{item.number}</Text>
            <Text className="text-xs text-gray-600">{item.type} • Piso {item.piso}</Text>
            <View className={`self-start mt-2 px-2 py-1 rounded-full ${statusColor(item.status)}`}><Text className={`text-[10px] font-bold ${statusColor(item.status).split(' ')[1]}`}>{item.status.toUpperCase()}</Text></View>
            <View className="flex-row mt-3 gap-2">
              <TouchableOpacity onPress={() => openEdit(item)} className="flex-1 bg-white border py-1.5 rounded-full items-center"><Text className="text-xs">Editar</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => remove(item.id)} className="px-3 py-1.5 rounded-full bg-red-50 items-center"><Text className="text-xs text-red-600">X</Text></TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text className="text-center text-gray-400 mt-20">No hay habitaciones. Agrega desde 101.</Text>}
      />

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white p-6 pt-12">
          <Text className="text-2xl font-bold mb-4">{editing ? 'Editar habitación' : 'Nueva habitación'}</Text>
          <TextInput placeholder="Número ej. 101" value={form.number} onChangeText={v => setForm({...form, number: v})} keyboardType="numeric" className="bg-gray-100 rounded-xl px-4 h-12 mb-3" />
          <Text className="text-sm font-bold mt-2 mb-2">Tipo</Text>
          <View className="flex-row flex-wrap gap-2 mb-3">{TYPES.map(t => (<TouchableOpacity key={t} onPress={() => setForm({...form, type: t})} className={`px-4 py-2 rounded-full border ${form.type===t ? 'bg-[#003B5C] border-[#003B5C]' : 'bg-white border-gray-200'}`}><Text className={`${form.type===t ? 'text-white' : 'text-gray-700'} text-sm`}>{t}</Text></TouchableOpacity>))}</View>
          <Text className="text-sm font-bold mt-2 mb-2">Estado</Text>
          <View className="flex-row flex-wrap gap-2 mb-3">{STATUS.map(s => (<TouchableOpacity key={s} onPress={() => setForm({...form, status: s})} className={`px-4 py-2 rounded-full border ${form.status===s ? 'bg-[#003B5C] border-[#003B5C]' : 'bg-white border-gray-200'}`}><Text className={`${form.status===s ? 'text-white' : 'text-gray-700'} text-sm`}>{s}</Text></TouchableOpacity>))}</View>
          <TextInput placeholder="Piso" value={form.piso} onChangeText={v => setForm({...form, piso: v})} keyboardType="numeric" className="bg-gray-100 rounded-xl px-4 h-12 mb-3" />
          <View className="flex-row gap-3 mt-6">
            <TouchableOpacity onPress={() => setModalVisible(false)} className="flex-1 h-14 bg-gray-100 rounded-xl items-center justify-center"><Text className="font-bold">Cancelar</Text></TouchableOpacity>
            <TouchableOpacity onPress={save} className="flex-1 h-14 bg-[#003B5C] rounded-xl items-center justify-center"><Text className="text-white font-bold">Guardar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
