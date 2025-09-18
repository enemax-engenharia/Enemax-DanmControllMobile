import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NotInspectedReason } from '../types/inspection';

interface NotInspectedModalProps {
  visible: boolean;
  onSelect: (reason: NotInspectedReason) => void;
  onClose: () => void;
}

const reasons: NotInspectedReason[] = [
  'Impossibilidade de acesso',
  'Saúde e Segurança do Trabalho',
];

export default function NotInspectedModal({ 
  visible, 
  onSelect, 
  onClose 
}: NotInspectedModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Motivo do Não Inspecionado</Text>
          
          {reasons.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={styles.button}
              onPress={() => onSelect(reason)}
            >
              <Text style={styles.buttonText}>{reason}</Text>
            </TouchableOpacity>
          ))}
          
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
    width: 320,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    padding: 12,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
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