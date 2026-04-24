import { View, StyleSheet, Alert, Linking } from "react-native";
import ToolButton from "../../buttons/ToolButton";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import QuestionForUser from "../QuestionForUser";
import { useDatabase } from "../../../../DatabaseContext";


const Scanner = ({ scanned, setScanned, }) => {
    const { VIDEO_URL } = useDatabase();
    const [answer, setAnswer] = useState(false);
    const [camera, setCamera] = useState(true);
    const [userInput, setUserInput] = useState("")
    const OpenQrCode = async (link) => {
        try {
            await Linking.openURL(link);
        } catch (err) {
            console.log("❌ Error opening links", err);
        }
    };

    const hadleQrCodeScanned = ({ type, data }) => {
        console.log("send ", data);
        OpenQrCode(data)

        setAnswer(true)
        setCamera(false);
    };

    const userAnswer = () => {
        console.log("userInput : ", userInput);
        const url = userInput.trim();

        if (!url.startsWith("http://localhost:8080/?")) {
            console.log("Invalid URL format");
            setScanned(false);
            return;
        }
        sendCode(url);
        setScanned(false);
    };

    const sendCode = async (code) => {
        const safeUrl = encodeURIComponent(code)
        const res = await fetch(`${VIDEO_URL}/api/auth/finishAuth?code=${safeUrl}`);
        if (res.ok) {
            const data = await res.json();
            console.log("Success: ", data.message);
        }
    };

    return (
        <View style={styles.camera}>
            <QuestionForUser answer={answer} setUserInput={setUserInput} userInput={userInput} userAnswer={userAnswer} />
            {camera &&
                <CameraView
                    style={[StyleSheet.absoluteFill, styles.cameraSpace]}
                    onBarcodeScanned={scanned ? undefined : hadleQrCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ['qr'],
                    }}
                />
            }
        </View>
    )
}

export default function QrCode({ setScanned, scanned }) {
    const [permission, requestPermission] = useCameraPermissions();


    const RequestPermission = () => {
        console.log("Work")
        setScanned(true);
        requestPermission()
    }
    if (!permission) {
        console.log("No permission");
    };

    return (
        <View style={styles.container}>
            <ToolButton buttonFunction={RequestPermission} iconName={'qrCode'} />
        </View>
    );
};

QrCode.Scanner = Scanner;

const styles = StyleSheet.create({
    container: {
        //borderColor:'green',
        //borderWidth:1,
        justifyContent: 'center',
        alignContent: 'center',
        marginLeft: 10
    },
    camera: {
        //borderColor:'green',
        //borderWidth:1,
        position: 'absolute',
        width: '100%',
        height: '100%'
    },
    cameraSpace: {
        zIndex: 1
    }
})