import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { InspectionImage } from '../types/inspection';

interface ImageGridProps {
  images: InspectionImage[];
  onImagePress: (image: InspectionImage, index: number) => void;
}

export default function ImageGrid({ images, onImagePress }: ImageGridProps) {
  return (
    <View style={styles.grid}>
      {images.map((img, idx) => (
        <TouchableOpacity 
          key={idx} 
          style={styles.item} 
          onPress={() => onImagePress(img, idx)}
        >
          <Image source={{ uri: img.uri }} style={styles.image} />
          {img.status && (
            <Text style={styles.status}>{img.status}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  item: {
    width: '47%',
    marginBottom: 15,
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 8,
  },
  label: {
    textAlign: 'center',
    marginTop: 5,
    fontWeight: 'bold',
  },
  status: {
    textAlign: 'center',
    marginTop: 2,
    fontSize: 12,
    color: '#666',
  },
});