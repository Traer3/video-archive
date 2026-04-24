import { View, StyleSheet, Pressable, Text, TextInput, AppState } from "react-native"
import Authorize from "./Authorization/Authorization";
import QrCode from "./Authorization/QrCode";
import { useState } from "react";

export default function Menu({ areaState }) {
    const [scanned, setScanned] = useState(false);

    const onAreaPress = () => {
        areaState(false)
    }

    return (
        <Pressable style={styles.wrapper} onPress={onAreaPress}>
            <View style={styles.conteiner}>
                <Authorize />
                <QrCode setScanned={setScanned} scanned={scanned} />
            </View>

            <QrCode.Scanner show={scanned} setScanned={setScanned} />

        </Pressable>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        position: 'absolute',
        width: '100%',
        height: '92%',
        zIndex: 3,
        borderWidth: 0.1,
    },
    conteiner: {
        position: 'absolute',
        width: '100%',
        height: '8%',
        top: 771,
        backgroundColor: 'rgb(71, 103, 151)',
        borderWidth: 0.5,
        //borderColor:'red',
        flexDirection: "row",
        justifyContent: 'center',
        alignContent: 'center',

    },
})