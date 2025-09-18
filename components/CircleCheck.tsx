import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function CirculoCheck() {

    return (
        <View style={styles.checkCircleContainer}>
            <Svg width={140} height={140} viewBox="0 0 140 140">
                <Circle
                    cx={70}
                    cy={70}
                    r={66}
                    stroke="#4CB050"
                    strokeWidth={8}
                    fill="#fff"
                />
                <Path
                    d="M45 75 L65 95 L100 55"
                    stroke="#4CB050"
                    strokeWidth={10}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </Svg>
        </View>
    )
}

const styles = StyleSheet.create({
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
    // Estilos para o círculo verde com check
    checkCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 4,
        borderColor: '#4CB050',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 8,
    },
    checkCircleInner: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkMarkContainer: {
        position: 'absolute',
        left: 32,
        top: 48,
        width: 56,
        height: 40,
        transform: [{ rotate: '-5deg' }],
    },
    checkMarkStem: {
        position: 'absolute',
        width: 8,
        height: 28,
        backgroundColor: '#4CB050',
        borderRadius: 4,
        left: 0,
        top: 12,
        transform: [{ rotate: '-45deg' }],
    },
    checkMarkKick: {
        position: 'absolute',
        width: 8,
        height: 48,
        backgroundColor: '#4CB050',
        borderRadius: 4,
        left: 20,
        top: 0,
        transform: [{ rotate: '45deg' }],
    },
    sentText: {
        fontSize: 20,
        color: '#222',
        fontWeight: '500',
        marginTop: 8,
    },
    checkCircleContainer: {
    marginBottom: 24,
    marginTop: 8,
  },
});

