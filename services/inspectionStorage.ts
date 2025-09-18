import AsyncStorage from '@react-native-async-storage/async-storage';
import { InspectionImage } from '../types/inspection';
import { getDamName } from './authStorageService';


export const saveInspectionData = async (data: InspectionImage[]): Promise<void> => {
  try {
    const damName = await getDamName();
    const STORAGE_KEY = `@inspection_images_${damName}`;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Erro ao salvar:', e);
  }
};

export const getInspectionData = async (): Promise<InspectionImage[] | null> => {
  try {
    const damName = await getDamName();
    const STORAGE_KEY = `@inspection_images_${damName}`;
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Erro ao carregar:', e);
    return null;
  }
};