import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { Alert, Button, Modal, StyleSheet, Text, View } from 'react-native';
import { apiRequest } from "../services/apiService";

type Props = {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
};

export default function ImportFileModal({ visible, onClose, onSuccess }: Props) {
    const [fileName, setFileName] = useState<string | null>(null);

    async function handlePickFile() {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'text/csv',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                ],
                copyToCacheDirectory: true,
            });

            if (!result.canceled) {
                const file = result.assets[0];

                // Validação: arquivo existe, tem uri e tamanho
                if (!file || !file.uri || file.size === 0) {
                    Alert.alert(
                        'Arquivo inválido',
                        'Se você selecionou um arquivo do Google Drive, baixe ele para o seu dispositivo antes de importar.'
                    );
                    return;
                }

                setFileName(file.name);

                // Exemplo de envio:
                const formData = new FormData();
                formData.append('file', {
                    uri: file.uri,
                    name: file.name,
                    type: file.mimeType || 'application/octet-stream',
                } as any);
                await apiRequest('/Instrument/create-instrument-template-from-list', "POST", formData);
                if (onSuccess) onSuccess(); // <-- aqui!
                Alert.alert('Arquivo enviado', file.name);
                onClose();
            }
        } catch (error: any) {
            console.error("API Error:", error);
            Alert.alert('Erro', 'Ocorreu um erro ao importar o arquivo.');
        }
    }

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Importar arquivo (.xlsx ou .csv)</Text>
                    <Text style={styles.tip}>
                        Dica: Para importar arquivos do Google Drive, baixe o arquivo para o seu dispositivo antes de selecionar.
                    </Text>
                    <Button title="Selecionar arquivo" onPress={handlePickFile} />
                    {fileName && <Text style={{ marginTop: 10 }}>{fileName}</Text>}
                    <Button title="Fechar" onPress={onClose} color="#888" />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 24,
        minWidth: 250,
        elevation: 10,
    },
    title: {
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    tip: {
        fontSize: 13,
        color: '#666',
        marginBottom: 16,
        textAlign: 'center',
    },
});