import { useEffect, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { styled } from 'nativewind';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);
const StyledText = styled(Text);

export default function PanelRecepcion() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'orders'), where('status', '==', 'nuevo'));

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(items);
      },
      error => {
        console.error('Error listening orders:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <StyledScrollView className="flex-1 bg-white p-4">
      <StyledText className="text-2xl font-bold mb-4">Panel de Recepción</StyledText>
      <StyledText className="text-sm text-gray-600 mb-6">
        Pedidos nuevos en tiempo real.
      </StyledText>

      {orders.length === 0 ? (
        <StyledText className="text-base text-gray-500">No hay pedidos nuevos.</StyledText>
      ) : (
        orders.map(order => (
          <StyledView
            key={order.id}
            className="rounded-2xl border border-gray-200 p-4 mb-4 bg-gray-50"
          >
            <StyledText className="font-semibold text-lg">Habitación {order.room}</StyledText>
            <StyledText className="text-sm text-gray-600 mt-1">
              Total: ${order.total ?? 0} MXN
            </StyledText>
            <StyledText className="text-sm text-gray-600 mt-1">
              Items: {order.items?.length ?? 0}
            </StyledText>
          </StyledView>
        ))
      )}
    </StyledScrollView>
  );
}
