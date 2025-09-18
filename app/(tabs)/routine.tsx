import ImageGrid from '@/components/ImageGrid';
import { getInspectionData, saveInspectionData } from '@/services/inspectionStorage';
import { InspectionImage } from '@/types/inspection';
import * as FileSystem from 'expo-file-system';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ActionSheetIOS, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { apiRequest } from "../../services/apiService";
import { getDamName, getPermissionToAddRoutines } from "../../services/authStorageService";

const defaultImages: InspectionImage[] = [];

export default function Routine() {
  const [images, setImages] = useState<InspectionImage[]>(defaultImages);
  const router = useRouter();
  const [dam, setDam] = useState<string | undefined>(undefined);
  const [permissionToAddRoutines, setPermissionToAddRoutines] = useState<string | undefined>(undefined);
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadImages();
    }, [])
  );

  useEffect(() => {
    findDamName().then(damName => {
      setDam((damName ? `${damName} - Rotineira` : 'Usina'));
    });
    getPermission().then(permission => {
      setPermissionToAddRoutines(permission || 'false');
    });
  }, []);

  // Configura o botão do menu no header
  useLayoutEffect(() => {
    // Com expo-router, podemos usar Stack.Screen options com headerRight render prop
    // Aqui usamos setOptions via JSX abaixo (Stack.Screen) com headerRight
  }, []);

  async function findDamName() {
    try {
      return await getDamName();
    } catch (error) {
      Alert.alert('Erro ao carregar nome da usina.', String(error));
      return 'Usina';
    }
  }

  async function getPermission() {
    try {
      return await getPermissionToAddRoutines();
    } catch (error) {
      Alert.alert('Erro ao carregar nome da usina.', String(error));
      return 'Usina';
    }
  }

  const loadImages = async () => {
    const saved = await getInspectionData();
    if (saved && saved.length > 0) {
      setImages(saved);
    } else {
      setImages(defaultImages);
      await saveInspectionData(defaultImages);
    }
  };

  const handleImagePress = (img: InspectionImage, idx: number) => {
    router.push({ pathname: '/routine/ImageDetailScreen', params: { idx: idx.toString() } });
  };

  const handleSend = async () => {
    if (isSending) return;

    const data = await getInspectionData();
    if (!data || data.length === 0) {
      alert('Nenhuma inspeção para enviar.');
      return;
    }

    const imagesWithoutStatus = data.filter(img => !img.status);

    if (imagesWithoutStatus.length > 0) {
      Alert.alert(
        'Atenção',
        `Há ${imagesWithoutStatus.length} anomalia(s) sem monitoramento. Deseja enviar mesmo assim?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Enviar', style: 'destructive', onPress: () => sendData(data) }
        ]
      );
    } else {
      sendData(data);
    }
  };

  const sendData = async (data: InspectionImage[]) => {
    setIsSending(true);
    try {
      const imagesWithBase64 = await Promise.all(
        data.map(async ({ uri, label, status, notInspectedReason, date }) => {
          const imageBase64 = await uriToBase64(uri);
          if (!imageBase64) return null;
          return {
            label,
            imageBase64,
            status: status || null,
            notInspectedReason: notInspectedReason || null,
            date: date
          };
        })
      );

      const filteredImages = imagesWithBase64.filter(Boolean) as {
        label: string;
        imageBase64: string;
        status: string | null;
        notInspectedReason: string | null;
        date?: string;
      }[];

      if (filteredImages.length === 0) {
        alert('Nenhuma imagem local para enviar.');
        return;
      }

      const payload = { routines: filteredImages };
      await apiRequest('/Routine/create-routine', "POST", payload);

      const cleaned = data.map(({ uri, label }) => ({
        uri,
        label,
        date: ""
      } as InspectionImage));
      await saveInspectionData(cleaned);
      setImages(cleaned);

      alert('Dados enviados e campos limpos com sucesso!');
    } catch (e) {
      console.log(e);
      alert('Erro ao enviar dados.');
    } finally {
      setIsSending(false);
    }
  };

  async function uriToBase64(uri: string): Promise<string | null> {
    if (uri.startsWith('file://')) {
      return await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    } else {
      return null;
    }
  }

  // MENU: ações
  const onPressMenu = () => {
    const options = ['Atualizar', 'Deletar', 'Cancelar'];
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex: 1, // "Deletar"
          cancelButtonIndex: 2
        },
        (buttonIndex) => {
          if (buttonIndex === 0) handleRefreshFromApi();
          if (buttonIndex === 1) handleDeleteLocal();
        }
      );
    } else {
      Alert.alert(
        'Menu',
        'Escolha uma ação',
        [
          { text: 'Atualizar', onPress: handleRefreshFromApi },
          { text: 'Deletar', style: 'destructive', onPress: handleDeleteLocal },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    }
  };

  // Deletar: apenas apaga dados locais
  const handleDeleteLocal = async () => {
    try {
      await saveInspectionData([]);
      setImages([]);
      Alert.alert('Sucesso', 'Dados locais deletados.');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível deletar os dados locais.');
    }
  };

  // Atualizar: apaga locais e busca na API, salvando o retorno
  const handleRefreshFromApi = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await saveInspectionData([]);
      setImages([]);

      const response = await apiRequest('/Routine', 'GET');
      const routines = Array.isArray(response?.value) ? response.value : [];

      const mapped: InspectionImage[] = routines.map((item: any) => ({
        uri: `data:image/jpeg;base64,${item.imageBase64}`, // Corrigido: imageBase64 (minúsculo) + formato data URI
        label: String(item.label ?? ''),
      })).filter((x: InspectionImage) => x.uri && x.label);

      await saveInspectionData(mapped);
      setImages(mapped);
      setRefreshKey(k => k + 1);

      Alert.alert('Sucesso', 'Dados atualizados a partir do banco de dados.');
    } catch (e) {
      console.log(e);
      Alert.alert('Erro', 'Falha ao atualizar a partir do banco de dados.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Rotineira',
          headerRight: () => (
            <TouchableOpacity onPress={onPressMenu} style={styles.headerBtn}>
              <Text style={styles.headerBtnText}>⋯</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ImageGrid
            key={refreshKey}
            images={images}
            onImagePress={handleImagePress}
          />
        </ScrollView>
        {
          permissionToAddRoutines === 'True' ?
            <TouchableOpacity
              style={styles.fab}
              onPress={() => router.push('/routine/RegisterInspectionScreen')}
            >
              <Text style={styles.fabText}>+</Text>
            </TouchableOpacity> : null
        }
      </View>

      <TouchableOpacity
        style={[styles.sendBtn, isSending && styles.sendBtnDisabled]}
        onPress={handleSend}
        disabled={isSending}
      >
        <Text style={styles.sendBtnText}>{isSending ? 'Enviando...' : 'Enviar'}</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 50,
    backgroundColor: '#28a745',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    zIndex: 100,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    lineHeight: 32,
  },
  sendBtn: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 10,
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sendBtnDisabled: {
    backgroundColor: '#cccccc',
  },
  headerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerBtnText: {
    fontSize: 22,
  },
});