import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { InspectionStatus } from '../types/inspection';

interface StatusDropdownProps {
  value: InspectionStatus | '';
  onChange: (status: InspectionStatus) => void;
}

const options: InspectionStatus[] = [
  'Permaneceu Constante',
  'Diminuiu',
  'Aumentou',
  'Não Inspecionado',
];

export default function StatusDropdown({ value, onChange }: StatusDropdownProps) {
  const [open, setOpen] = useState<boolean>(false);
  
  // Verifica se deve estar desabilitado
  const isDisabled = value === 'Nova';

  const handleSelect = (option: InspectionStatus) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <View>
      <TouchableOpacity 
        style={[styles.dropdown, isDisabled && styles.dropdownDisabled]} 
        onPress={() => !isDisabled && setOpen(true)} // Só abre se não estiver desabilitado
        disabled={isDisabled} // Propriedade nativa do TouchableOpacity
      >
        <Text style={[styles.dropdownText, isDisabled && styles.dropdownTextDisabled]}>
          {value || 'Selecione o status'}
        </Text>
      </TouchableOpacity>
      
      <Modal visible={open && !isDisabled} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.overlay} 
          onPress={() => setOpen(false)}
          activeOpacity={1}
        >
          <View style={styles.modal}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.option}
                onPress={() => handleSelect(opt)}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  dropdownDisabled: {
    backgroundColor: '#f5f5f5', // Fundo acinzentado
    borderColor: '#ddd',
    opacity: 0.6, // Deixa mais transparente
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownTextDisabled: {
    color: '#999', // Texto acinzentado
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: 280,
    maxHeight: 300,
  },
  option: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
});