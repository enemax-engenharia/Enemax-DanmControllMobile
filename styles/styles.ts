import { Picker } from '@react-native-picker/picker'; // Importando o Picker
import styled from "styled-components/native";


export const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  padding: 20px;
`;

export const Title = styled.Text`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
`;

export const Input = styled.TextInput`
  width: 100%;
  height: 50px;
  background-color: white;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
`;

export const PickerContainer = styled.View`
  width: 100%;
  height: 50px;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  justify-content: center;
  padding: 10px;
`;

export const PickerStyled = styled(Picker)`
  width: 100%;
  height: 100%;
  color: #333; // Para garantir que o texto tenha a cor desejada
`;

export const Button = styled.TouchableOpacity`
  width: 100%;
  height: 50px;
  background-color: #2ecc71;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
`;

export const ButtonText = styled.Text`
  color: white;
  font-size: 18px;
  font-weight: bold;
`;