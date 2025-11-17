import { View, StyleSheet, Pressable, Text, TextInput } from "react-native"
import ToolButton from "../buttons/ToolButton"
import { useEffect, useState } from "react"
import GAuthenticator from "../../../database/Autnification/GAuthenticator";
import { Linking } from "react-native";
import QuestionForUser from "./QuestionForUser";





export default function Menu ({areaState}) {
    const [authorized,setAuthorized] = useState(false); //будем передовать в компонент для авторизации
    const [logout, setLogout] = useState(false);
    const [question, setQuestion] = useState(false);
    const [autnification,setAutnification] = useState(false);
    const [answer, setAnswer] = useState(false);
    const [userInput, setUserInput] = useState("")

    //const [authUrl, setAuthUrl] = useState("");
    const [code, setCode] =  useState("");


    const onAuthorize =  async () => {
        setAuthorized(true);
        setAnswer(true)

        try{
            const responce = await fetch("http://192.168.0.8:3004/authorize");
            const data = await responce.json();
            if(data.url){
                Autnification(data.url)
            }
        }catch(err){
            console.log("Cant get url from server: ", err)
        }
        
        //setAutnification(true);
        
    }

    const sendCode = async (realCode) => {
        const res =  await fetch("http://192.168.0.8:3004/authorize/callback",{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({realCode})
        });
        const data = await res.json();
        console.log(data);
    };
    
    
    const onLogout = () => {
        
        setLogout(!logout);
        setQuestion(true)
    }
    

    const onRethink = () => {
        setQuestion(false);
        setAuthorized(true)
        setLogout(false)
    }

    const onExit = () => {
        areaState(false)
        setAuthorized(false)
        setLogout(false)
    }

    const onAreaPress = () => {

        areaState(false)
    }

    const userAnswer = () => {
        console.log(userInput);
        const url = userInput.trim();

        if(!url.startsWith("http://localhost:8080/?")){
            console.log("Invalid URL format");
            return;
        }

        try{
            const parsed = new URL(url);
            const codeParam = parsed.searchParams.get("code");

            if(!codeParam){
                console.log("Code parameter not found");
                return;
            }

            setCode(codeParam);

            console.log("Extracted code",codeParam);

            sendCode(codeParam);
        }catch(err){
            console.log("Error parsing URL",err)
        }

    }

    const  Autnification = async (link) => {
       try{
         await Linking.openURL(link);
       }catch(err){
            console.log("❌ Error opening links", err);
       }
    };

    
    return(
        <View style={styles.wrapper}>
            <QuestionForUser answer={answer} setUserInput={setUserInput} userInput={userInput} userAnswer={userAnswer}/>
                  
                <View style={styles.conteiner}>
                    <View style={styles.buttonPlacement}>
                        {question ?
                            <View style={{alignItems:'center',flexDirection:'column'}}>
                                <View style={styles.containerAnser}>
                                    <Text style={{fontSize:18, fontWeight:'600'}}>
                                        do you want to exit ? 
                                    </Text>
                                </View>
                                <View style={{flexDirection:'row', gap:30, padding:2}}>
                                    <ToolButton buttonFunction={onExit} iconName={'checkButton'} CHeight={30} CWidth={30}/>
                                    <ToolButton buttonFunction={onRethink} iconName={'deleteButton'} CHeight={30} CWidth={30}/>
                                </View>
                                

                            </View>
                            :
                            <>{authorized ? 
                                (
                                    <ToolButton buttonFunction={onLogout} iconName={logout ? 'deleteButton' : 'checkButton'} />
                                    
                                ):(
                                    <ToolButton buttonFunction={onAuthorize} iconName={'more'} />
                            )}</>
                        }
                                    
                        {
                        //autnification && <GAuthenticator/>
                        }               
                    </View>
                </View>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper:{ 
        flex:1,
        position:'absolute',
        width: '100%',
        height: '92%',
        zIndex:1,
        borderWidth:0.1,
        borderColor:'green',
        borderWidth:2
    },
    conteiner: {
        position:'absolute',
        width: '100%',
        height: '8%',
        top:771,
        backgroundColor:'rgb(71, 103, 151)',
        //backgroundColor:'rgb(255, 255, 0)',
        borderColor:'yellow',
        borderWidth:2
    },
    containerAnser:{
        //backgroundColor:'rgb(71, 103, 151)',
        //borderColor:'rgb(43,75,123)',
        //borderRadius:2,
        //borderWidth:1,
    },
    buttonPlacement:{
        flex:1,
        padding:2,
        justifyContent:'space-between',
        alignItems:'center',
        
        borderColor:'red',
        borderWidth:2
    },
    outerArea:{
        width:'100%',
        height:'100%',
        backgroundColor:'rgba(0,0,0,0.5)', // затемнение , а не прозрачность 
       // borderColor:'red',
       // borderWidth:2
    },
    answer:{
        position:'absolute',
        width: '80%',
        height: '15%',
        top:450,
        marginLeft:"10%",
        //backgroundColor:'rgb(71, 103, 151)',
        backgroundColor:'red',
        borderColor:'rgb(43,75,123)',
        borderWidth:2,
        borderRadius: 2,
        alignItems:'center',
        
    }
})