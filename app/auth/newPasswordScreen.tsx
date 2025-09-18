import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TouchableOpacity } from "react-native";
import { Button, ButtonText, Container, Input, Title } from "../../styles/styles";

const NewPasswordScreen: React.FC = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSavePassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    try {
      // Enviar nova senha para a API (simulação)
      const response = await fetch("http://dressup-api-copy-production.up.railway.app/api/useraccount/resetpassword", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, email }), // adicione o token se precisar
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Sucesso", "Senha alterada com sucesso!");
        router.push("./login");
      } else {
        Alert.alert("Erro", data.message || "Falha ao alterar senha");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Erro ao conectar-se ao servidor.");
    }
  };

  return (
    <Container>
      <Title>Crie uma nova senha</Title>

      <Input
        placeholder="Nova senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Input
        placeholder="Confirmar nova senha"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Button onPress={handleSavePassword}>
        <ButtonText>Salvar Nova Senha</ButtonText>
      </Button>

      <TouchableOpacity onPress={() => router.push("./login")}>
        <Text style={{ marginTop: 20, color: "#3498db" }}>Voltar para o login</Text>
      </TouchableOpacity>
    </Container>
  );
};

export default NewPasswordScreen;
