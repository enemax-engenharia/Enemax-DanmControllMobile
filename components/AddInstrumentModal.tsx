import { ClientInstrumentTemplateParameter, InstrumentType } from '@/constants/Types';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { apiRequest } from '../services/apiService';

type Props = {
  visible: boolean;
  selectedType: string;
  onSelectType: (value: string) => void;
  onClose: () => void;
};



export default function AddInstrumentModal({
  visible,
  selectedType,
  onSelectType,
  onClose,
}: Props) {
  const [instrumentTypes, setInstrumentTypes] = useState<InstrumentType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [parameters, setParameters] = useState<ClientInstrumentTemplateParameter[]>([]);



  useEffect(() => {
    if (visible) {
      fetchInstrumentTypes();
      setCustomName('');
      setParameters([]);
    }
  }, [visible]);

  async function fetchInstrumentTypes() {
    setLoading(true);
    try {
      const response = await apiRequest('/Instrument/get-instrument-types', 'GET');
      setInstrumentTypes(response.result || []);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar os tipos de instrumentos');
    } finally {
      setLoading(false);
    }
  }

  function handleAddParameter() {
    setParameters(prev => [...prev, { attentionValue: '', alertValue: '', domainId: '', parameterName: '' }]);
  }

  function updateParameter(index: number, field: keyof ClientInstrumentTemplateParameter, value: string) {
    setParameters(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function removeParameter(index: number) {
    setParameters(prev => prev.filter((_, i) => i !== index));
  }

  function cleanDecimal(value: string) {
    return value.replace(',', '.');
  }

  async function handleAdd() {
    if (!selectedType || !customName.trim()) {
      Alert.alert('Atenção', 'Selecione um tipo de instrumento e informe um nome.');
      return;
    }

    const payload = {
      instrumentTypeDomainId: selectedType,
      customName: customName.trim(),
      clientInstrumentTemplateParameter: parameters.map(param => ({
        measurementUnit: 2,
        alertValue: parseFloat(cleanDecimal(param.alertValue)),
        attentionValue: parseFloat(cleanDecimal(param.attentionValue)),
        parameterName: param.parameterName
      }))
    };

    try {
      await apiRequest('/Instrument/create-instrument-template', 'POST', payload);
      Alert.alert('Sucesso', 'Instrumento adicionado com sucesso.');
      onClose();
    } catch (error) {
      Alert.alert('Erro ao adicionar instrumento', String(error));
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackground} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Pressable onPress={() => { }}>

              <Text style={{ marginBottom: 10 }}>Selecione o tipo de instrumento</Text>
              {loading ? (
                <ActivityIndicator size="large" color="#000" />
              ) : (
                <Picker
                  selectedValue={selectedType}
                  onValueChange={(itemValue) => onSelectType(itemValue)}
                >
                  <Picker.Item label="Selecione..." value="" />
                  {instrumentTypes.map((type) => (
                    <Picker.Item key={type.domainId} label={type.name} value={type.domainId} />
                  ))}
                </Picker>
              )}

              <Text style={{ marginTop: 15 }}>Nome personalizado</Text>
              <TextInput
                value={customName}
                onChangeText={setCustomName}
                style={styles.input}
                placeholder="Digite um nome para o instrumento"
              />

              <Text style={{ marginTop: 15, fontWeight: 'bold' }}>Parâmetros</Text>
              {parameters.map((param, index) => (
                <View key={index} style={styles.parameterGroup}>
                  <TextInput
                    style={styles.input}
                    placeholder="Nome do parâmetro"
                    value={param.parameterName}
                    onChangeText={(value) => updateParameter(index, 'parameterName', value)}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Valor de Atenção"
                    keyboardType="decimal-pad"
                    value={param.attentionValue}
                    onChangeText={(value) => updateParameter(index, 'attentionValue', value)}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Valor de Alerta"
                    keyboardType="decimal-pad"
                    value={param.alertValue}
                    onChangeText={(value) => updateParameter(index, 'alertValue', value)}
                  />
                  <Pressable onPress={() => removeParameter(index)} style={styles.removeButton}>
                    <Text style={{ color: 'red', textAlign: 'center' }}>Remover</Text>
                  </Pressable>
                </View>
              ))}

              <Button title="+ Adicionar Parâmetro" onPress={handleAddParameter} />
              <View style={{ marginTop: 15 }} />
              <Button title="Adicionar" onPress={handleAdd} />
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    width: '90%',
    maxHeight: '90%',
    borderRadius: 10,
    elevation: 10,
  },
  scrollContent: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  parameterGroup: {
    marginTop: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  parameterTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  removeButton: {
    marginTop: 10,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
});
