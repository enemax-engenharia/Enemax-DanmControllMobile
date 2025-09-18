import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { apiRequest } from "../../services/apiService";
import { login } from "../../services/authService";


interface ClientDTO {
    domainId: string;
    name: string;
    companyName?: string;
}

const BarragensPage: React.FC = () => {
    const [barragens, setBarragens] = useState<ClientDTO[]>([]);
    const [selectedBarragem, setSelectedBarragem] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const router = useRouter();
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    // Função para buscar barragens da API
    const fetchBarragens = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await apiRequest("/User/get-dams", "GET");

            if (!response.success) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = response.result;
            setBarragens(data);

            // Define a primeira barragem como selecionada por padrão
            if (data.length > 0) {
                setSelectedBarragem(data[0].domainId);
            }
        } catch (error) {
            console.error('Erro ao buscar barragens:', error);
            Alert.alert(
                'Erro',
                'Não foi possível carregar as barragens. Tente novamente.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    // Função para salvar a barragem selecionada no AsyncStorage
    const salvarBarragem = async (): Promise<void> => {
        if (!selectedBarragem) {
            Alert.alert('Atenção', 'Por favor, selecione uma barragem.');
            return;
        }

        try {
            setSaving(true);

            // Encontra os dados completos da barragem selecionada
            const barragemSelecionada = barragens.find(
                (barragem: ClientDTO) => barragem.domainId === selectedBarragem
            );

            if (!barragemSelecionada) {
                throw new Error('Barragem selecionada não encontrada');
            }

            try {
                const token = await login(barragemSelecionada.domainId);
                if (!token) {
                    Alert.alert("Ocorreu um erro não esperado, contate a administração");
                    return;
                }
                router.replace('/(tabs)');
                return;
            } catch (e) {
                Alert.alert("Ocorreu um erro não esperado, contate a administração");
            }
        } catch (error) {
            console.error('Erro ao salvar barragem:', error);
            Alert.alert(
                'Erro',
                'Não foi possível salvar a barragem. Tente novamente.',
                [{ text: 'OK' }]
            );
        } finally {
            setSaving(false);
        }
    };

    // Carrega as barragens quando o componente é montado
    useEffect(() => {
        fetchBarragens();
    }, []);

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
                    <Text style={styles.title}>Selecione uma Barragem</Text>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#2D2D2F" />
                            <Text style={styles.loadingText}>Carregando barragens...</Text>
                        </View>
                    ) : barragens.length === 0 ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="warning-outline" size={48} color="#E53935" style={styles.errorIcon} />
                            <Text style={styles.errorText}>Nenhuma barragem encontrada</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={fetchBarragens}>
                                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <View style={styles.pickerContainer}>
                                <Ionicons name="business-outline" size={22} color="#2D2D2F" style={styles.icon} />
                                <Picker
                                    selectedValue={selectedBarragem}
                                    onValueChange={(itemValue: string) => setSelectedBarragem(itemValue)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Selecione uma barragem..." value="" />
                                    {barragens.map((barragem: ClientDTO) => (
                                        <Picker.Item
                                            key={barragem.domainId}
                                            label={barragem.name}
                                            value={barragem.domainId}
                                        />
                                    ))}
                                </Picker>
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    (!selectedBarragem || saving) && styles.buttonDisabled
                                ]}
                                onPress={salvarBarragem}
                                disabled={!selectedBarragem || saving}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="#222" />
                                ) : (
                                    <Text style={styles.buttonText}>Confirmar</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </LinearGradient>
    );
};

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
        marginTop: 20,
    },
    card: {
        width: '90%',
        backgroundColor: '#FAFAFA66',
        borderRadius: 20,
        padding: 24,
        shadowRadius: 8,
        minHeight: 300,
    },
    title: {
        fontSize: 26,
        fontWeight: '500',
        marginBottom: 24,
        color: '#222',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    errorIcon: {
        marginBottom: 16,
    },
    errorText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#EBEBEC',
        borderRadius: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    retryButtonText: {
        color: '#2D2D2F',
        fontSize: 16,
        fontWeight: '500',
    },
    pickerContainer: {
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
    picker: {
        flex: 1,
        color: '#2D2D2F',
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
    buttonDisabled: {
        backgroundColor: '#CCC',
        opacity: 0.6,
    },
    buttonText: {
        color: '#222',
        fontSize: 18,
        fontWeight: '500',
    },
});

export default BarragensPage;