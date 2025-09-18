import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAddManual: () => void;
  onImportFile: () => void;
};

export default function AddOptionsModal({ visible, onClose, onAddManual, onImportFile }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.option} onPress={onAddManual}>
            <Text style={styles.text}>Adicionar manualmente</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={onImportFile}>
            <Text style={styles.text}>Importar arquivo (.xlsx ou .csv)</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 24,
    minWidth: 250,
    elevation: 10,
  },
  option: {
    paddingVertical: 16,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
});