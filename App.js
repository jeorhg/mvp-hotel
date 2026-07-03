import './i18n';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { useTranslation } from 'react-i18next';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledButton = styled(TouchableOpacity);

export default function App() {
  const { t } = useTranslation();

  return (
    <StyledSafeAreaView className="flex-1 bg-slate-50">
      <StyledView className="flex-1 items-center justify-center px-6">
        <StyledText className="text-3xl font-bold text-slate-900 mb-4">{t('welcome')}</StyledText>
        <StyledText className="text-base text-slate-600 text-center mb-8">{t('instruction')}</StyledText>
        <StyledButton className="bg-slate-900 px-6 py-3 rounded-full shadow-lg">
          <StyledText className="text-white font-semibold">Expo + Tailwind</StyledText>
        </StyledButton>
      </StyledView>
      <StatusBar style="dark" />
    </StyledSafeAreaView>
  );
}
