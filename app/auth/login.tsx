import EsqueciSenhaModal from '@/components/ForgotPassword';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import React, { useLayoutEffect, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { authenticate } from "../../services/authService";

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passowrdError, setpassowrdError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const router = useRouter();
  return (
    <LinearGradient
      colors={['#002DC5', '#D3D6D8', '#FFFFFF']}
      start={{ x: 0.5, y: 1 }}
      end={{ x: 0.5, y: 0 }}
      style={styles.gradient}
    >
      <View style={styles.container}>

        <Image
          source={require('../../assets/images/splash-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.card}>
          <View style={[
            styles.inputContainer,
            emailError ? styles.inputContainerError : null
          ]}>
            <Ionicons name="person-outline" size={22} color="#2D2D2F" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (text) setEmailError('');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={emailError ? '#E53935' : '#A0A0A0'}
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <View style={[
            styles.inputContainer,
            passowrdError ? styles.inputContainerError : null
          ]}>
            <Ionicons name="lock-closed-outline" size={22} color="#2D2D2F" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (text) setpassowrdError('');
              }}
              secureTextEntry={!showPassword}
              placeholderTextColor={passowrdError ? '#E53935' : '#A0A0A0'}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#2D2D2F" />
            </TouchableOpacity>
          </View>
          {passowrdError ? <Text style={styles.errorText}>{passowrdError}</Text> : null}

          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.forgot}>Esqueci a senha</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={async () => {
              let hasError = false;

              if (!email) {
                setEmailError('Informe o e-mail');
                hasError = true;
              } else {
                setEmailError('');
              }

              if (!password) {
                setpassowrdError('Informe a senha');
                hasError = true;
              } else {
                setpassowrdError('');
              }

              if (hasError) return;

              // Chamada à API
              try {
                const token = await authenticate(email, password);
                if (!token) {
                  setEmailError('E-mail ou senha inválidos');
                  setpassowrdError('E-mail ou senha inválidos');
                  return;
                }
                router.replace('./choseDam');
                return;
              } catch (e) {
                setpassowrdError(e instanceof Error ? e.message : 'Erro desconhecido');
              }
            }}
          >
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </View>
      <EsqueciSenhaModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </LinearGradient>
  );
}

export default Login;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  logo: {
    width: 160,
    height: 80,
    marginBottom: 20,
    marginTop: 20
  },
  card: {
    width: '90%',
    backgroundColor: '#FAFAFA66',
    borderRadius: 20,
    padding: 24,
    shadowRadius: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '500',
    marginBottom: 24,
    color: '#222',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBEBEC',
    borderRadius: 24,
    paddingHorizontal: 16,
    marginBottom: 30,
    height: 48,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2D2D2F',
    fontFamily: 'Roboto'

  },
  forgot: {
    alignSelf: 'flex-end',
    color: '#000000',
    marginBottom: 20,
    marginTop: -8,
    fontSize: 14,
    fontFamily: 'Inter'
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#222',
    fontSize: 18,
    fontWeight: '500',
  },
  inputContainerError: {
    borderWidth: 1.5,
    borderColor: '#E53935', // vermelho de erro
  },
  errorText: {
    color: '#E53935',
    fontSize: 13,
    marginTop: -24,
    marginBottom: 16,
    marginLeft: 8,
    fontFamily: 'Inter',
  },
});