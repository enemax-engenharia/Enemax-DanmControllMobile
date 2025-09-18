import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { ClientInstrumentTemplateParameter } from '../constants/Types';

interface Props {
    value: string;
    onChangeValue: (val: string) => void;
    placeholder?: string;
    param: ClientInstrumentTemplateParameter;
    editable?: boolean; // <-- Nova prop
}

export const ReadingInputWithUnit = ({
    value,
    onChangeValue,
    placeholder,
    param,
    editable = true, // <-- Valor padrão true
}: Props) => {
    const [menuVisible, setMenuVisible] = useState(false);

    const getReadingInputStyle = (value: string, param: ClientInstrumentTemplateParameter) => {
        value = value.replace(',', '.');
        const num = parseFloat(value);
        if (isNaN(num)) return styles.input;

        const alertValue = parseFloat(param.alertValue);
        const attentionValue = parseFloat(param.attentionValue);

        if (!isNaN(alertValue) && num > alertValue) {
            return [styles.input, { backgroundColor: '#ffcc99', paddingStart: 3 }]; // laranja
        }
        if (!isNaN(attentionValue) && num > attentionValue) {
            return [styles.input, { backgroundColor: '#fff199', paddingStart: 3 }]; // amarelo
        }

        return styles.input;
    };

    return (
        <View style={[
            styles.wrapper,
            !editable && styles.disabledWrapper // <-- Estilo para desabilitado
        ]}>
            <TextInput
                value={value}
                onChangeText={(text) => {
                    // permite somente números, vírgula e ponto
                    let cleaned = text.replace(/[^0-9.,]/g, '');

                    // evita múltiplos separadores decimais: mantém o primeiro, remove os demais
                    const firstSepIndex = Math.max(cleaned.indexOf(','), cleaned.indexOf('.'));
                    if (firstSepIndex !== -1) {
                        const before = cleaned.slice(0, firstSepIndex + 1);
                        const after = cleaned.slice(firstSepIndex + 1).replace(/[.,]/g, '');
                        cleaned = before + after;
                    }

                    // opcional: limitar as casas durante a digitação (mantém no máx. 2 após o separador)
                    cleaned = cleaned.replace(/^([0-9]+)([.,])?([0-9]{0,2}).*$/, (_m, int, sep = '', frac = '') => {
                        return int + sep + frac;
                    });

                    onChangeValue(cleaned);
                }}
                onBlur={() => {
                    if (!value) return;

                    // normaliza para ponto p/ parse
                    const normalized = value.replace(',', '.');

                    const num = Number(normalized);
                    if (!isNaN(num)) {
                        // formata com 2 casas
                        let formatted = num.toFixed(2);

                        // se quiser exibir vírgula para o usuário:
                        formatted = formatted.replace('.', ',');

                        onChangeValue(formatted);
                    }
                }}
                placeholder={placeholder}
                keyboardType="numeric"
                style={[
                    getReadingInputStyle(value, param),
                    !editable && styles.disabledInput
                ]}
                editable={editable}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    disabledWrapper: {
        backgroundColor: '#f5f5f5',
        borderColor: '#ddd',
    },
    input: {
        flex: 1,
        paddingHorizontal: 10,
        height: 50,
        fontSize: 16,
    },
    disabledInput: {
        backgroundColor: '#f5f5f5',
        color: '#888',
    },
    suffix: {
        paddingHorizontal: 12,
        height: 50,
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        borderLeftWidth: 1,
        borderLeftColor: '#ccc',
    },
    suffixText: {
        fontSize: 16,
        fontWeight: '500',
    },
});