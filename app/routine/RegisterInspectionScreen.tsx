import { getInspectionData, saveInspectionData } from '@/services/inspectionStorage';
import { InspectionImage } from '@/types/inspection';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputContentSizeChangeEventData,
  TouchableOpacity,
  View
} from 'react-native';

export default function RegisterInspectionScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [label, setLabel] = useState<string>('');
  const router = useRouter();
  const [inputHeight, setInputHeight] = useState(48);

  const pickFromCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!imageUri || !label.trim()) {
      Alert.alert('Atenção', 'Selecione uma imagem e preencha a legenda.');
      return;
    }
    const newImage: InspectionImage = {
      uri: imageUri,
      label: label.trim(),
      status: 'Nova',
      date: new Date().toISOString().split('T')[0],
    };
    const images = (await getInspectionData()) || [];
    images.push(newImage);
    await saveInspectionData(images);
    Alert.alert('Sucesso', 'Inspeção cadastrada!');
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Nova Inspeção' }} />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#f8fafd' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 35} // tente aumentar aqui
      >
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <TouchableOpacity
                style={[
                  styles.imagePicker,
                  imageUri ? styles.imagePickerWithImage : styles.imagePickerEmpty
                ]}
                onPress={() => {
                  Alert.alert(
                    'Selecionar imagem',
                    'Como deseja adicionar a imagem?',
                    [
                      { text: 'Tirar Foto', onPress: pickFromCamera },
                      { text: 'Escolher da Galeria', onPress: pickFromGallery },
                      { text: 'Cancelar', style: 'cancel' }
                    ]
                  );
                }}
                activeOpacity={0.8}
              >
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera" size={48} color="#b0b8c1" />
                    <Text style={styles.imagePlaceholderText}>Adicionar Imagem</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Legenda</Text>
                <TextInput
                  style={[styles.input, { height: Math.max(48, inputHeight) }]}
                  placeholder="Digite uma legenda para a imagem"
                  value={label}
                  onChangeText={setLabel}
                  placeholderTextColor="#b0b8c1"
                  maxLength={300}
                  multiline
                  onContentSizeChange={(
                    e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>
                  ) => setInputHeight(e.nativeEvent.contentSize.height)}
                />
              </View>
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name="checkmark-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.saveBtnText}>Salvar Inspeção</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  imagePicker: {
    width: 275,
    height: 275,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  imagePickerEmpty: {
    backgroundColor: '#e9eef3',
    borderWidth: 2,
    borderColor: '#d1d8e0',
  },
  imagePickerWithImage: {
    backgroundColor: '#fff',
    borderWidth: 0,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: '#b0b8c1',
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    color: '#222',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f3f6fa',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#222',
    borderWidth: 1,
    borderColor: '#e0e6ed',
    minHeight: 48,
    textAlignVertical: 'top',
  },
  footer: {
    backgroundColor: '#f8fafd',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
    marginBottom: 10,
    // sombra opcional:
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
});