import { useRouter } from 'expo-router';
import React, { useState } from "react";
import { Alert, Text, TouchableOpacity } from "react-native";
import { Button, ButtonText, Container, Input, Title } from "../../styles/styles";


const ForgotPasswordScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Erro", "Por favor, insira seu e-mail!");
      return;
    }
    setLoading(true);
    // Simulação de envio de email de recuperação

    
    try {
      const response = await fetch(`http://dressup-api-copy-production.up.railway.app/api/useraccount/requestpasswordreset?email=${email}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert("Sucesso", "Um link de recuperação foi enviado para seu e-mail!");
        router.push({
          pathname: './validateToken', // o nome da rota
          params: { email: email }, // parâmetros que serão enviados
        });
      } else {
        Alert.alert("Erro", data.message || "Falha ao fazer login");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro ao conectar-se ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Recuperar Senha</Title>

      <Input 
        placeholder="Digite seu e-mail" 
        keyboardType="email-address" 
        autoCapitalize="none" 
        value={email} 
        onChangeText={setEmail} 
      />

      <Button onPress={handleResetPassword} disabled={loading}>
        <ButtonText>{loading ? "Enviando..." : "Enviar"}</ButtonText>
      </Button>

      <TouchableOpacity onPress={() => router.push("./login")}>
        <Text style={{ marginTop: 20, color: "#3498db" }}>Voltar para o login</Text>
      </TouchableOpacity>
    </Container>
  );
};

export default ForgotPasswordScreen;
