import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from "@expo/vector-icons";
import { Stack, Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
    <Stack.Screen options={{ headerShown: false, presentation: 'card' }} />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            headerShown: true,
            tabBarIcon: ({ color }) => <Ionicons name="information-outline" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
        name="routine"
        options={{
          title: 'Rotineira',
          headerShown: true,
          tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={28} color={color} />,
          }}
          />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Sair',
            tabBarIcon: ({ color }) => <Ionicons name="log-out-outline" size={28} color={color} />
            ,
          }}
        />
      </Tabs>
    </>
  );
}
