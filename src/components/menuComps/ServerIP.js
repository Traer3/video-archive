import { useState } from 'react';
import ToolButton from '../buttons/ToolButton';
import { StyleSheet, View } from 'react-native';
import QuestionForUser from './QuestionForUser';
import { useDatabase } from '../../../DatabaseContext';

export default function ServerIP() {
    const [toggleQuestion, setToggleQuestion] = useState(false);
    const [variant, setVariant] = useState(true);
    const [serverIP, setServerIP] = useState('192.168.0.8');
    const [serverPORT, setServerPORT] = useState('3001');
    const [serverAnswer, setServerAwnser] = useState(false);

    const {updateServerConfig} = useDatabase()
    const toggleInput = () => {
        setServerAwnser(false)
        setToggleQuestion(true)
    }
    const toggleNewQuestion = () => {
        console.log("serverIP : ", serverIP)
        console.log("serverPORT : ", serverPORT)
        setToggleQuestion(false)
        setVariant(true)
        setServerAwnser(true)
        saveToPhone(serverIP, serverPORT)
    }

    const saveToPhone = async (ip, port) => {
        await updateServerConfig(ip,port)
    }

    return (
        <>
            {variant ? (
                <QuestionForUser answer={toggleQuestion} setUserInput={setServerIP} userInput={serverIP} userAnswer={() => { setVariant(false) }} question={'ip'} />
            ) : (
                <QuestionForUser answer={toggleQuestion} setUserInput={setServerPORT} userInput={serverPORT} userAnswer={toggleNewQuestion} question={'port'} />
            )

            }
            <View style={styles.container}>
                <ToolButton buttonFunction={toggleInput} iconName={serverAnswer ? 'serverIconGOOD' : 'serverIcon'} />
            </View>
        </>
    );
};
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
