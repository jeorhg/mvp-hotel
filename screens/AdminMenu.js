import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, Alert, Modal, ActivityIndicator } from 'react-native';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../firebase';

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', desc: '', price: '', image: '', category: 'Plato Fuerte', disponible: true });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'menu'), snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      // Si hay error de permisos, mostrar
      console.log('Firestore error:', err.message);
    });
    return () => unsub();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', desc: '', price: '', image: '', category: 'Plato Fuerte', disponible: true });
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ ...item, price: String(item.price) });
    setModalVisible(true);
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Necesitas dar permiso a fotos'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4,3],
      quality: 0.5, // Baja calidad para que quepa en Firestore (sin Storage)
      base64: true,
    });
    if (!result.canceled) {
      const base64 = result.assets[0].base64;
      // Guardamos como data-uri directo en Firestore, sin pasar por Storage
      const dataUri = `data:image/jpeg;base64,${base64}`;
      setForm(f => ({ ...f, image: dataUri }));
    }
  };

  const save = async () => {
    if (!form.name || !form.price) { Alert.alert('Falta nombre y precio'); return; }
    const data = { ...form, price: Number(form.price), updatedAt: serverTimestamp(), hotelId: 'grand-velas' };
    try {
      if (editing) await updateDoc(doc(db, 'menu', editing.id), data);
      else await addDoc(collection(db, 'menu'), { ...data, createdAt: serverTimestamp() });
      setModalVisible(false);
    } catch(e){ Alert.alert('Error', e.message); }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 flex-row justify-between items-center border-b border-gray-100">
        <Text className="font-bold text-lg">Menú ({items.length}) - Sin tarjeta</Text>
        <TouchableOpacity onPress={openNew} className="bg-[#003B5C] px-4 py-2 rounded-full"><Text className="text-white font-bold">+ Nuevo</Text></TouchableOpacity>
      </View>
      <FlatList data={items} keyExtractor={i => i.id} contentContainerStyle={{ padding: 12 }} renderItem={({ item }) => (
        <View className="bg-gray-50 rounded-xl p-3 mb-3 flex-row">
          <Image source={{ uri: item.image || 'https://via.placeholder.com/100' }} className="w-16 h-16 rounded-lg bg-gray-200" />
          <View className="flex-1 ml-3"><Text className="font-bold">{item.name} - ${item.price}</Text><Text className="text-xs text-gray-500">{item.category}</Text></View>
          <View className="items-end"><TouchableOpacity onPress={() => openEdit(item)} className="bg-white border px-3 py-1 rounded-full mb-1"><Text className="text-xs">Editar</Text></TouchableOpacity><TouchableOpacity onPress={() => { Alert.alert('Borrar?', '', [{text:'Cancelar'},{text:'Borrar', onPress: async ()=>{await deleteDoc(doc(db,'menu',item.id))}}])}} className="bg-red-50 px-3 py-1 rounded-full"><Text className="text-xs text-red-600">Borrar</Text></TouchableOpacity></View>
        </View>
      )} ListEmptyComponent={<Text className="text-center text-gray-400 mt-20">No hay platillos</Text>} />

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white p-6 pt-12">
          <Text className="text-2xl font-bold mb-4">{editing ? 'Editar' : 'Nuevo platillo'}</Text>
          <TextInput placeholder="Nombre *" value={form.name} onChangeText={v => setForm({...form, name: v})} className="bg-gray-100 rounded-xl px-4 h-12 mb-3" />
          <TextInput placeholder="Descripción" value={form.desc} onChangeText={v => setForm({...form, desc: v})} className="bg-gray-100 rounded-xl px-4 h-12 mb-3" />
          <TextInput placeholder="Precio MXN *" value={form.price} onChangeText={v => setForm({...form, price: v})} keyboardType="numeric" className="bg-gray-100 rounded-xl px-4 h-12 mb-3" />
          
          <TouchableOpacity onPress={pickImage} className="bg-[#D4AF37]/20 border border-[#D4AF37] border-dashed rounded-xl h-40 items-center justify-center mb-3">
            {form.image ? <Image source={{ uri: form.image }} className="w-full h-full rounded-xl" resizeMode="cover" /> : <View className="items-center"><Text className="text-3xl">📸</Text><Text className="font-bold text-[#003B5C]">Elegir de galería</Text><Text className="text-xs text-gray-500">Sin necesidad de tarjeta</Text></View>}
          </TouchableOpacity>

          <TextInput placeholder="Categoría" value={form.category} onChangeText={v => setForm({...form, category: v})} className="bg-gray-100 rounded-xl px-4 h-12 mb-3" />
          <View className="flex-row gap-3 mt-6">
            <TouchableOpacity onPress={() => setModalVisible(false)} className="flex-1 h-14 bg-gray-100 rounded-xl items-center justify-center"><Text className="font-bold">Cancelar</Text></TouchableOpacity>
            <TouchableOpacity onPress={save} className="flex-1 h-14 bg-[#003B5C] rounded-xl items-center justify-center"><Text className="text-white font-bold">Guardar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}