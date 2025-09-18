import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = "userToken";
const DAM_NAME = "damName";
const PERMISSION_ADD_ROUTINES = "permissionToAddRoutines";

export const saveToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const saveUserInfos = async (token: string, damName: string, permissionToAddRoutines: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(DAM_NAME, damName);
  await AsyncStorage.setItem(PERMISSION_ADD_ROUTINES, permissionToAddRoutines);
};

export const getToken = async () => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const getDamName = async () => {
  return await AsyncStorage.getItem(DAM_NAME);
};

export const getPermissionToAddRoutines = async () => {
  return await AsyncStorage.getItem(PERMISSION_ADD_ROUTINES);
};


export const removeToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(DAM_NAME);
  await AsyncStorage.removeItem(PERMISSION_ADD_ROUTINES);
};




