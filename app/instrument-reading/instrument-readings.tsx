import { ReadingInputWithUnit } from '@/components/ReadingInputWithUnit ';
import { ClientInstrumentTemplate, ClientInstrumentTemplateParameter } from '@/constants/Types';
import { getDamName } from '@/services/authStorageService';
import { MaterialIcons } from '@expo/vector-icons'; // para o ícone de lápis
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

function AnimatedCard({ children, style }: { children: React.ReactNode; style?: any }) {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [animation]);

  const animatedStyle = {
    opacity: animation,
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.95, 1],
        }),
      },
    ],
  };

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

export default function InstrumentReadings() {
  const [readings, setReadings] = useState<Record<string, any>>({});
  const [observationsHeight, setObservationsHeight] = useState<Record<string, number>>({});
  const router = useRouter();
  const params = useLocalSearchParams();
  const instruments: ClientInstrumentTemplate[] = useMemo(
    () => JSON.parse(params.instruments as string),
    [params.instruments]
  );
  const date = params.date as string;
  const [editableInstruments, setEditableInstruments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadReadings = async () => {
      try {
        const damName = await getDamName();
        const storageKey = `@instrument_readings_${damName}`;
        const jsonValue = await AsyncStorage.getItem(storageKey);
        if (jsonValue != null) {
          const parsed = JSON.parse(jsonValue);

          const restored: Record<string, any> = {};
          (parsed.readings || []).forEach((reading: any) => {
            const instrument = instruments.find(i => i.domainId === reading.instrumentTemplateId);
            if (!instrument) return;

            const values: Record<string, any> = {};
            (instrument.clientInstrumentTemplateParameter ?? []).forEach(param => {
              const paramName = param.parameterName;
              const paramId = param.domainId;
              if (reading.values && reading.values[paramName] !== undefined) {
                values[paramId] = { value: reading.values[paramName] };
              }
            });

            restored[reading.instrumentTemplateId] = {
              values,
              notes: reading.notes || "",
              date: reading.date || null,
            };
          });

          setReadings(restored);
        }
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível carregar as leituras salvas.');
        console.error(e);
      }
    };
    if (instruments && instruments.length > 0) {
      loadReadings();
    }
  }, [instruments]);

  const updateReading = (instrumentTemplateId: string, parameterId: string, value: string) => {
    setReadings((prev) => ({
      ...prev,
      [instrumentTemplateId]: {
        ...prev[instrumentTemplateId],
        values: {
          ...(prev[instrumentTemplateId]?.values || {}),
          [parameterId]: {
            ...(prev[instrumentTemplateId]?.values?.[parameterId] || {}),
            value,
          },
        },
      },
    }));
  };


  const saveReadings = async () => {
    try {
      const readingsArray = instruments.map((instrument) => {
        const id = instrument.domainId;
        const reading = readings[id];
        if (!reading) return null;

        const values: Record<string, any> = {};
        (instrument.clientInstrumentTemplateParameter ?? []).forEach((param) => {
          const paramId = param.domainId;
          const paramName = param.parameterName;
          const valueObj = reading.values?.[paramId];
          if (valueObj && valueObj.value !== undefined) {
            values[paramName] = valueObj.value;
          }
        });

        return {
          instrumentTemplateId: id,
          instrumentTypeId: instrument.instrumentType.domainId,
          instrumentTypeName: instrument.instrumentType.name,
          customName: instrument.customName,
          values,
          notes: reading.notes || "",
          date: new Date().toISOString().split('T')[0],
        };
      }).filter(Boolean);

      const payload = {
        readings: readingsArray,
      };
      const damName = await getDamName();
      const storageKey = `@instrument_readings_${damName}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(payload));
      Alert.alert('Sucesso', 'Leituras salvas localmente!');
      router.push(`/(tabs)`);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar as leituras.');
      console.error(e);
    }
  };

  const getReadingWarning = (value: string, param: ClientInstrumentTemplateParameter) => {
    value = value.replace(',', '.');
    const num = parseFloat(value);
    if (isNaN(num)) return null;

    const alertValue = parseFloat(param.alertValue);
    const attentionValue = parseFloat(param.attentionValue);

    if (!isNaN(alertValue) && num > alertValue) {
      return { type: 'alert', message: `Valor maior que o de alerta: ${alertValue}` };
    }

    if (!isNaN(attentionValue) && num > attentionValue) {
      return { type: 'attention', message: `Valor maior que o de atenção: ${attentionValue}` };
    }

    return null;
  };


  return (
    <>
      <Stack.Screen options={{ title: `Leitura - ${instruments[0]?.instrumentType.name}` }} />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>


        {instruments.map((instrument) => {
          const isDisabled = !!readings[instrument.domainId]?.date && !editableInstruments[instrument.domainId];
          const readingDate = readings[instrument.domainId]?.date;
          return (
            <AnimatedCard key={instrument.domainId} style={styles.instance}>
              <View style={styles.headerRow}>
                <Text style={styles.label}>{instrument.customName}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {readingDate && (
                    <Text style={styles.dateText}>
                      Data: {new Date(readingDate).toLocaleDateString('pt-BR')}
                    </Text>
                  )}
                  <TouchableOpacity
                    onPress={async () => {
                      Alert.alert(
                        'Editar leitura',
                        'Essa leitura ainda não foi enviada, deseja editar mesmo assim?',
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                            text: 'Sim',
                            onPress: async () => {
                              const storageKey = `@instrument_readings_${instrument.instrumentType.domainId}`;
                              const jsonValue = await AsyncStorage.getItem(storageKey);
                              let payload = jsonValue ? JSON.parse(jsonValue) : { readings: [] };

                              // Corrija o tipo do filtro aqui também!
                              payload.readings = (payload.readings || []).filter(
                                (r: { instrumentTemplateId: string }) => r.instrumentTemplateId !== instrument.domainId
                              );

                              await AsyncStorage.setItem(storageKey, JSON.stringify(payload));

                              setEditableInstruments(prev => ({
                                ...prev,
                                [instrument.domainId]: true,
                              }));
                              setReadings(prev => ({
                                ...prev,
                                [instrument.domainId]: {
                                  ...prev[instrument.domainId],
                                  date: null,
                                },
                              }));
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <MaterialIcons
                      name="edit"
                      size={18}
                      color="#888"
                      style={{ marginLeft: 4 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>


              {(instrument.clientInstrumentTemplateParameter ?? []).map((param) => {
                const paramId = param.domainId;
                const paramValueObj = readings[instrument.domainId]?.values?.[paramId] || {};
                const paramValue = paramValueObj.value || '';

                return (
                  <View key={paramId} style={styles.paramContainer}>
                    <ReadingInputWithUnit
                      value={paramValue}
                      onChangeValue={(text) => updateReading(instrument.domainId, paramId, text)}
                      placeholder={param.parameterName}
                      param={param}
                      editable={!isDisabled}
                    />

                    {(() => {
                      const warning = getReadingWarning(paramValue, param);
                      return warning ? (
                        <View style={{
                          backgroundColor: warning.type === 'alert' ? '#ffe6cc' : '#fff9cc',
                          padding: 8,
                          borderRadius: 6,
                          marginBottom: 12,
                        }}>
                          <Text style={{
                            color: warning.type === 'alert' ? '#ff6600' : '#cc9900',
                            fontWeight: '600',
                          }}>
                            {warning.message}
                          </Text>
                        </View>
                      ) : null;
                    })()}
                  </View>
                );
              })}



              <TextInput
                placeholder="Observações"
                style={[
                  styles.input,
                  { height: Math.max(40, observationsHeight[instrument.domainId] || 40) },
                ]}
                multiline
                value={readings[instrument.domainId]?.notes || ''}
                onChangeText={(text) =>
                  setReadings((prev) => ({
                    ...prev,
                    [instrument.domainId]: {
                      ...prev[instrument.domainId],
                      notes: text,
                    },
                  }))
                }
                onContentSizeChange={(event) => {
                  const height = event.nativeEvent.contentSize.height;
                  setObservationsHeight((prev) => ({
                    ...prev,
                    [instrument.domainId]: height,
                  }));
                }}
                editable={!isDisabled}
              />
            </AnimatedCard>
          );
        })}


        <View style={styles.saveButtonContainer}>
          <Button title="Salvar Leituras" onPress={saveReadings} />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  instance: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 6,
    height: 60,
  },
  saveButtonContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  paramContainer: {
    marginBottom: 16,
  },
  inputField: {
    flex: 1,
    paddingHorizontal: 10,
    height: 50,
    fontSize: 16,
  },
  unitPickerWrapper: {
    width: 110,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#ccc',
  },
  unitPicker: {
    width: '100%',
    height: 50,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 15,
    color: '#222',
    marginRight: 2,
  },
});
