import { useEffect, useRef } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ToastProps = {
    visible: boolean;
    message: string;
    onHide: () => void;
};

export default function Toast({
    visible,
    message,
    onHide,
}: ToastProps) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        if (!visible) return;

        opacity.setValue(0);
        translateY.setValue(20);

        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();

        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 20,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start(({ finished }) => {
                if (finished) onHide();
            });
        }, 2000);

        return () => clearTimeout(timer);
    }, [visible, message, opacity, translateY, onHide]);

    if (!visible) return null;

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                styles.container,
                {
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        >
            <View style={styles.content}>
                <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color="#FFFFFF"
                />
                <Text style={styles.message}>{message}</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 30,
        left: 20,
        right: 20,
        zIndex: 999,
        elevation: 10,
    },
    content: {
        backgroundColor: "#171717",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    message: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "500",
        flex: 1,
    },
});
