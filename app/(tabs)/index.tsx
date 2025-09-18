import AddOptionsModal from '@/components/AddOptionsModal';
import ImportFileModal from '@/components/ImportFileModal';
import InstrumentItem from '@/components/InstrumentItem';
import { ClientInstrumentTemplate } from '@/constants/Types';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AddInstrumentModal from '../../components/AddInstrumentModal';
import { apiRequest } from "../../services/apiService";
import { getDamName } from "../../services/authStorageService";



export default function Home() {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [instruments, setInstruments] = useState<ClientInstrumentTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [addInstrumentModalVisible, setAddInstrumentModalVisible] = useState(false);
  const [dam, setDam] = useState<string | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('Piezômetro'); // default

  async function fetchInstruments() {
    try {
      setLoading(true);
      const data = await apiRequest("/Instrument/get-list-instruments-templates", "GET");
      const instrumentsArray = data.result || [];
      setInstruments(instrumentsArray);
    } catch (error) {
      Alert.alert('Erro ao carregar instrumentos', String(error));
    } finally {
      setLoading(false);
    }
  }

  async function findDamName() {
    try {
      return await getDamName();
    }
    catch (error) {
      Alert.alert('Erro ao carregar nome da usina.', String(error));
      return 'Usina';
    }
  }

  useEffect(() => {
    fetchInstruments();

    findDamName().then(damName => {
      setDam(damName + ' - Instrumentação' || 'Usina');
    });
  }, []);

  async function sendReadings() {
    try {
      const allReadings = await getAllInstrumentReadings();

      if (!allReadings.length) {
        Alert.alert('Aviso', 'Nenhuma leitura salva para enviar.');
        return;
      }

      const normalizedReadings = allReadings.map(reading => ({
        ...reading,
        values: Object.keys(reading.values || {}).reduce((acc, key) => {
          const value = reading.values[key];
          acc[key] = typeof value === 'string' ? value.replace(',', '.') : value;
          return acc;
        }, {} as Record<string, any>)
      }));

      const payload = {
        readings: normalizedReadings,
      };


      const instrumentReadings = payload.readings || {};
      const allInstrumentNames = allReadings.map(reading => reading.customName);
      const expectedInstrumentNames = instruments.map(i => i.customName);

      const missingInstruments = expectedInstrumentNames.filter(
        name => !allInstrumentNames.includes(name)
      );

      const proceedWithSending = async () => {
        const payload = {
          readings: instrumentReadings,
        };

        await apiRequest('/Instrument/send-instrument-readings', "POST", payload);

        const allKeys = await AsyncStorage.getAllKeys();
        const readingKeys = allKeys.filter(key => key.startsWith('@instrument_readings_'));
        await AsyncStorage.multiRemove(readingKeys);
        // Alert.alert('Dados', JSON.stringify(payload));
        Alert.alert('Sucesso', 'Leituras enviadas com sucesso!');
      };

      if (missingInstruments.length > 0) {
        Alert.alert(
          'Leituras Incompletas',
          `Faltam leituras para os instrumentos:\n\n${missingInstruments.join('\n')}\n\nDeseja continuar mesmo assim?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Enviar assim mesmo', onPress: proceedWithSending }
          ]
        );
      } else {
        await proceedWithSending();
      }


    } catch (error) {
      Alert.alert('Erro', String(error));
    }
  }

  async function getAllInstrumentReadings() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const damName = await getDamName();
      const readingKeys = allKeys.filter(key => key.startsWith(`@instrument_readings_${damName}`));
      const stores = await AsyncStorage.multiGet(readingKeys);
      const allReadings = stores
        .map(([key, value]) => {
          if (!value) return [];
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed.readings) ? parsed.readings : [];
          } catch {
            return [];
          }
        })
        .flat();
      return allReadings;
    } catch (error) {
      console.error('Erro ao buscar todas as leituras:', error);
      return [];
    }
  }


  const onChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  async function clearReadingsOnStorage() {
    Alert.alert(
      'Limpar leituras',
      `Deseja realmente limpar todas as leituras?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            const allKeys = await AsyncStorage.getAllKeys();
            const readingKeys = allKeys.filter(key => key.startsWith(`@instrument_readings`));
            await AsyncStorage.multiRemove(readingKeys);
          }
        }
      ]
    );
  }


  const handleNavigate = (instrumentTypeId: string) => {
    const dateString = date.toISOString().split('T')[0];
    const relatedInstruments = instruments.filter(
      (item) => item.instrumentType.domainId === instrumentTypeId
    );
    router.push({
      pathname: '/instrument-reading/instrument-readings',
      params: {
        date: dateString,
        instruments: JSON.stringify(relatedInstruments), // lista completa de instrumentos do mesmo tipo
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Instrumentação' }} />
      <View style={{ flex: 1 }}>
        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChange}
          />
        )}
        {/* <View style={{ marginBottom: 10, padding: 10 }}>
          <Text style={styles.label}>Condições Climáticas</Text>
          <Picker
            selectedValue={weather}
            onValueChange={(val) => setWeather(val)}
            style={styles.input}
          >
            <Picker.Item label="☀️ Sol" value="sol" />
            <Picker.Item label="🌧️ Chuva" value="chuva" />
          </Picker>
        </View> */}


        <FlatList
          style={{ flex: 1 }}
          data={Array.from(
            new Map(instruments.map(item => [item.instrumentType.domainId, item])).values()
          )}
          keyExtractor={(item) => item.instrumentType.domainId}
          renderItem={({ item }) => (
            <InstrumentItem
              item={item}
              onPress={() => handleNavigate(item.instrumentType.domainId)}
            />
          )}
          refreshing={loading}
          onRefresh={fetchInstruments}
        />



        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>

        <View style={styles.saveButtonContainer}>
          <Button title="Enviar Leituraaas" onPress={sendReadings} />
        </View>
      </View>

      <TouchableOpacity style={styles.trash} onPress={() => clearReadingsOnStorage()}>
        <Ionicons name="trash" size={24} color="#ff3333" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.fab} onPress={() => setOptionsModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AddOptionsModal
        visible={optionsModalVisible}
        onClose={() => setOptionsModalVisible(false)}
        onAddManual={() => {
          setOptionsModalVisible(false);
          setAddInstrumentModalVisible(true);
        }}
        onImportFile={() => {
          setOptionsModalVisible(false);
          setImportModalVisible(true);
        }}
      />

      <AddInstrumentModal
        visible={addInstrumentModalVisible}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        onClose={() => {
          setAddInstrumentModalVisible(false);
          fetchInstruments();
        }}
      />

      <ImportFileModal
        visible={importModalVisible}
        onClose={() => setImportModalVisible(false)}
        onSuccess={fetchInstruments}
      />
    </>
  );
}

const styles = StyleSheet.create({
  datePickerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  selectedDate: {
    marginBottom: 8,
    fontSize: 16,
  },
  instrument: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  type: {
    fontSize: 18,
    marginBottom: 8,
  },
  saveButtonContainer: {
    padding: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
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
  trash: {
    position: 'absolute',
    left: 20,
    bottom: 80,
    backgroundColor: '#fff',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    zIndex: 100,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 6,
    height: 60,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
