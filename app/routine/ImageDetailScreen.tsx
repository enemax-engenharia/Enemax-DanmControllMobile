import ImageModal from '@/components/ImageModal';
import NotInspectedModal from '@/components/NotInspectedModal';
import StatusDropdown from '@/components/StatusDropdown';
import { getInspectionData, saveInspectionData } from '@/services/inspectionStorage';
import { InspectionImage, InspectionStatus, NotInspectedReason } from '@/types/inspection';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ImageDetailScreen() {
    const { idx } = useLocalSearchParams<{ idx: string }>();
    const router = useRouter();
    const imageIndex = parseInt(idx || '0', 10);

    const [images, setImages] = useState<InspectionImage[]>([]);
    const [currentImage, setCurrentImage] = useState<InspectionImage | null>(null);
    const [status, setStatus] = useState<InspectionStatus | ''>('');
    const [notInspectedReason, setNotInspectedReason] = useState<NotInspectedReason | ''>('');
    const [showNotInspectedModal, setShowNotInspectedModal] = useState<boolean>(false);
    const [showImageModal, setShowImageModal] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            await ImagePicker.requestCameraPermissionsAsync();
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        })();
        loadImageData();
    }, [imageIndex]);

    const loadImageData = async () => {
        const savedImages = await getInspectionData();
        if (savedImages && savedImages.length > imageIndex) {
            setImages(savedImages);
            const image = savedImages[imageIndex];
            setCurrentImage(image);
            setStatus(image.status || '');
            setNotInspectedReason(image.notInspectedReason || '');
        } else {
            Alert.alert('Erro', 'Imagem não encontrada.');
            router.back();
        }
    };

    const handleStatusChange = (newStatus: InspectionStatus) => {
        setStatus(newStatus);
        if (newStatus === 'Não Inspecionado') {
            setShowNotInspectedModal(true);
        } else {
            setNotInspectedReason('');
        }
    };

    const handleNotInspectedSelect = (reason: NotInspectedReason) => {
        setNotInspectedReason(reason);
        setShowNotInspectedModal(false);
    };

    const handlePickFromCamera = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                quality: 0.7,
                allowsEditing: false,
            });
            if (!result.canceled && result.assets[0]) {
                const newUri = result.assets[0].uri;
                const updatedImages = [...images];
                updatedImages[imageIndex] = {
                    ...updatedImages[imageIndex],
                    uri: newUri
                };
                setImages(updatedImages);
                setCurrentImage(updatedImages[imageIndex]);
                await saveInspectionData(updatedImages); // <-- Salva imediatamente
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível tirar a foto');
        }
        setShowImageModal(false);
    };

    const handlePickFromGallery = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                quality: 0.7,
                allowsEditing: false,
            });
            if (!result.canceled && result.assets[0]) {
                const newUri = result.assets[0].uri;
                const updatedImages = [...images];
                updatedImages[imageIndex] = {
                    ...updatedImages[imageIndex],
                    uri: newUri
                };
                setImages(updatedImages);
                setCurrentImage(updatedImages[imageIndex]);
                await saveInspectionData(updatedImages); // <-- Salva imediatamente
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível selecionar a imagem');
        }
        setShowImageModal(false);
    };

    const handleDelete = () => {
        Alert.alert(
            'Confirmar Exclusão',
            'Tem certeza que deseja excluir esta anomalia? Esta ação não pode ser desfeita.',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const updatedImages = images.filter((_, index) => index !== imageIndex);
                            await saveInspectionData(updatedImages);
                            Alert.alert('Sucesso!', 'Anomalia excluída com sucesso.');
                            router.back();
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível excluir a anomalia.');
                        }
                    }
                }
            ]
        );
    };

    const handleSave = async () => {
        if (!status) {
            Alert.alert('Atenção', 'Por favor, selecione um status para a inspeção.');
            return;
        }
        const savedImages = await getInspectionData();
        if (!savedImages || savedImages.length <= imageIndex) {
            Alert.alert('Erro', 'Imagem não encontrada para salvar.');
            return;
        }
        const updatedImages = [...savedImages];
        updatedImages[imageIndex] = {
            ...updatedImages[imageIndex],
            status: status as InspectionStatus,
            notInspectedReason: notInspectedReason as NotInspectedReason || undefined,
            date: new Date().toISOString().split('T')[0],
        };
        await saveInspectionData(updatedImages);
        Alert.alert('Sucesso!', 'Dados da inspeção salvos com sucesso.');
        router.back();
    };

    if (!currentImage) {
        return (
            <View style={styles.container}>
                <Text>Carregando...</Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: currentImage.label,
                    headerRight: () => (
                        <TouchableOpacity onPress={handleDelete} style={styles.headerDeleteBtn}>
                            <Ionicons name="trash-outline" size={24} color="#dc3545" />
                        </TouchableOpacity>
                    )
                }}
            />
            <KeyboardAvoidingView
                style={{ flex: 1, backgroundColor: '#f8fafd' }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
            >
                <View style={{ flex: 1 }}>
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, paddingBottom: 180, alignItems: 'center', paddingHorizontal: 24, paddingTop: 32 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.imageContainer}>
                            <TouchableOpacity
                                activeOpacity={0.85}
                                onPress={() => setShowImageModal(true)}
                                style={styles.imageTouchable}
                            >
                                <Image
                                    source={{ uri: currentImage.uri }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                                <View style={styles.imageOverlay}>
                                    <Ionicons name="camera" size={32} color="#fff" />
                                </View>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>{currentImage.label}</Text>

                        <StatusDropdown
                            value={status}
                            onChange={handleStatusChange}
                        />

                        {status === 'Não Inspecionado' && notInspectedReason && (
                            <View style={styles.reasonContainer}>
                                <Text style={styles.reasonLabel}>Motivo:</Text>
                                <Text style={styles.reasonText}>{notInspectedReason}</Text>
                            </View>
                        )}
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                            <Ionicons name="checkmark-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.saveBtnText}>Salvar Inspeção</Text>
                        </TouchableOpacity>
                    </View>

                    <ImageModal
                        visible={showImageModal}
                        onPickFromCamera={handlePickFromCamera}
                        onPickFromGallery={handlePickFromGallery}
                        onClose={() => setShowImageModal(false)}
                    />

                    <NotInspectedModal
                        visible={showNotInspectedModal}
                        onSelect={handleNotInspectedSelect}
                        onClose={() => setShowNotInspectedModal(false)}
                    />
                </View>
            </KeyboardAvoidingView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafd',
    },
    headerDeleteBtn: {
        padding: 8,
        marginRight: 8,
    },
    imageContainer: {
        width: 275,
        height: 275,
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 32,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        backgroundColor: '#e9eef3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageTouchable: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 18,
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: 'rgba(44,62,80,0.7)',
        borderRadius: 20,
        padding: 6,
    },
    label: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 24,
        color: '#222',
        textAlign: 'center',
        width: '100%',
    },
    reasonContainer: {
        marginTop: 16,
        padding: 14,
        backgroundColor: '#f3f6fa',
        borderRadius: 10,
        width: '100%',
    },
    reasonLabel: {
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 4,
        fontSize: 15,
    },
    reasonText: {
        color: '#666',
        fontSize: 15,
    },
    footer: {
        backgroundColor: '#f8fafd',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: -2 },
        elevation: 8,
        gap: 12,
    },
    deleteBtn: {
        flexDirection: 'row',
        backgroundColor: '#dc3545',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 200,
    },
    deleteBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    saveBtn: {
        flexDirection: 'row',
        backgroundColor: '#28a745',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 200,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 17,
        letterSpacing: 0.5,
    },
});