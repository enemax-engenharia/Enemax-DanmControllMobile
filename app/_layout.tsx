import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { getToken } from "../services/authStorageService";

import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await getToken();
        const isValid = !!token;
        setIsLoggedIn(isValid);
        if (!isValid) {
          // Aguarda um microtempo para garantir que a navegação não ocorra durante render
          setTimeout(() => {
            router.replace("/auth/login");
          }, 0);
        }
      } catch (error) {
        console.error("Erro ao verificar o status de login:", error);
        setIsLoggedIn(false);
        setTimeout(() => {
          router.replace("/auth/login");
        }, 0);
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (isLoggedIn !== null) {
      SplashScreen.hideAsync(); // Só oculta a splash screen quando o estado estiver definido
    }
  }, [isLoggedIn]);

  if (isLoggedIn === null) {
    return null; // Exibe tela de loading até carregar
  }


  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PaperProvider>
        {/* <SafeAreaView style={{ flex: 1 }}> */}
          {isLoggedIn ? (
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          ) : (
            <Stack>
              <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            </Stack>
          )
          }
        {/* </SafeAreaView> */}
      </PaperProvider>

    </ThemeProvider>

  );
}
