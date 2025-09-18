import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ImageModalProps {
  visible: boolean;
  onPickFromCamera: () => void;
  onPickFromGallery: () => void;
  onClose: () => void;
}

export default function ImageModal({ 
  visible, 
  onPickFromCamera, 
  onPickFromGallery, 
  onClose 
}: ImageModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Substituir Imagem</Text>
          
          <TouchableOpacity style={styles.button} onPress={onPickFromCamera}>
            <Text style={styles.buttonText}>Tirar foto agora</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={onPickFromGallery}>
            <Text style={styles.buttonText}>Escolher da galeria</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    width: 300,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    padding: 12,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#007bff',
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  cancel: {
    marginTop: 16,
    padding: 10,
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
});