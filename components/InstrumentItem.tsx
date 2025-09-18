import { ClientInstrumentTemplate } from '@/constants/Types';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

type InstrumentItemProps = {
  item: ClientInstrumentTemplate;
  onPress: () => void;
};

export default function InstrumentItem({ item, onPress }: InstrumentItemProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.type}>{item.instrumentType.name}</Text>
      <Button title="Adicionar Leitura" onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  type: {
    fontSize: 18,
    marginBottom: 8,
  },
});