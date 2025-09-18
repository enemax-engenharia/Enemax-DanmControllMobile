import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CircleCheck from './CircleCheck';

type EsqueciSenhaModalProps = {
  visible: boolean;
  onClose: () => void;
};

const { width } = Dimensions.get('window');



const ForgotPassword: React.FC<EsqueciSenhaModalProps> = ({ visible, onClose }) => {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);
  const router = useRouter();


  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (sent) {
      timer = setTimeout(() => {
        router.navigate('../auth/codigoConfirmacao');
        setSent(false);
        setEmail('');
        onClose();
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [sent]);

  const handleSend = async () => {
    if (!email) return;
    setLoading(true);
    try {
      // Substitua pela sua API real
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSent(true);
    } catch (error) {
      // Trate o erro conforme necessário
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSent(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Botão de fechar */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>

          <Text style={styles.title}>Esqueci a senha</Text>

          {sent ? (
            <>
              <CircleCheck />
              <Text style={styles.sentText}>E-mail enviado</Text>
            </>
          ) : (
            <>
              <Text style={styles.subtitle}>Digite o e-mail cadastrado</Text>
              <View style={styles.inputContainer}>
                <Icon name="email" size={24} color="#333" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="E-mail"
                  placeholderTextColor="#333"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
              <TouchableOpacity style={styles.button} onPress={handleSend} disabled={loading || !email}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Enviar</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // ... (os mesmos estilos anteriores)
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.8,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 18,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 1,
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '400',
    color: '#222',
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 18,
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 28,
    paddingHorizontal: 12,
    width: '100%',
    height: 56,
    marginBottom: 22,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
  button: {
    backgroundColor: '#25505E',
    borderRadius: 46,
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '400',
  },
  checkCircleContainer: {
    marginBottom: 24,
    marginTop: 8,
  },
  sentText: {
    fontSize: 20,
    color: '#222',
    fontWeight: '500',
    marginTop: 8,
  },
});

export default ForgotPassword;