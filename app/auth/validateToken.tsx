import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Button, ButtonText, Container, Title } from "../../styles/styles";


const CODE_LENGTH = 6;

const VerifyTokenScreen: React.FC = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const inputs = useRef<Array<TextInput | null>>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };


  const handleVerifyCode = async () => {

    if (code.includes("")) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    // Aqui você faria a verificação real com o backend
    try {
      const sendToken = code.join("");
      const response = await fetch('http://dressup-api-copy-production.up.railway.app/api/useraccount/confirmtoken', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendToken, email }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Sucesso", "Um link de recuperação foi enviado para seu e-mail!");
        router.push({
          pathname: './newPasswordScreen',
          params: { email: email },
        });

      } else {
        Alert.alert("Erro", data.message || "Falha ao fazer login");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Erro ao conectar-se ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Digite o código enviado por e-mail</Title>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 30 }}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputs.current[index] = ref;
            }}
            style={{
              borderBottomWidth: 2,
              borderColor: "#ccc",
              width: 40,
              height: 50,
              fontSize: 24,
              textAlign: "center",
            }}
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            returnKeyType="next"
          />
        ))}
      </View>

      <Button onPress={handleVerifyCode}>
        <ButtonText>Verificar Código</ButtonText>
      </Button>

      <TouchableOpacity onPress={() => router.push("./login")}>
        <Text style={{ marginTop: 20, color: "#3498db" }}>Voltar para o login</Text>
      </TouchableOpacity>
    </Container>
  );
};

export default VerifyTokenScreen;
