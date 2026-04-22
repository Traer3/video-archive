import { View, StyleSheet, Pressable, Text, TextInput, AppState } from "react-native"
import ToolButton from "../buttons/ToolButton"
import { useEffect, useState } from "react"
import { Linking } from "react-native";
import QuestionForUser from "./QuestionForUser";
import { useDatabase } from "../../../DatabaseContext";

export default function Menu ({areaState}) {
    const {VIDEO_URL} = useDatabase(); 
    const [authorized,setAuthorized] = useState(false);
    const [logout, setLogout] = useState(false);
    const [question, setQuestion] = useState(false);
    const [answer, setAnswer] = useState(false);
    const [userInput, setUserInput] = useState("")
   

    const [rerender, setRerender] = useState(0)

    useEffect(()=>{
        const listener = AppState.addEventListener("change",(state)=>{
            if(state === "active"){
                setRerender(Date.now());
            }
        });
        return() => listener.remove()
    },[])


    useEffect(()=>{
        const checkToken = async () => {
            try{
                const responce = await fetch(`${VIDEO_URL}/api/auth/checkToken`);
                const answer = await responce.json();
                setAuthorized(answer.data)
            }catch(err){
                console.error("Server failed to check token")
            }
        }
        checkToken()
    },[])


    const onAuthorize =  async () => {
        setAnswer(true)
        try{
            const responce = await fetch(`${VIDEO_URL}/api/auth/getAuthUrl`);
            const answer = await responce.json();
            console.log(answer.message)
            if(answer.data){
                Autnification(answer.data)
            }
        }catch(err){
            console.log("Cant get url from server: ", err)
        };
    }

    const sendCode = async (code) => {
        const safeUrl = encodeURIComponent(code)
        const res =  await fetch(`${VIDEO_URL}/api/auth/finishAuth?code=${safeUrl}`);
        if(res.ok){
            const data = await res.json();
            console.log("Success: ", data.message);
        }
        setAnswer(false)
    };

    const onDeleteToken = async () => {
        const responce = await fetch(`${VIDEO_URL}/api/auth/deleteToken`);
        const answer = await responce.json();
        console.log(`${answer.message}`)
    }
    
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
        onDeleteToken()
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

        sendCode(url);
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
            <QuestionForUser key={rerender} answer={answer} setUserInput={setUserInput} userInput={userInput} userAnswer={userAnswer}/>
                  
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
        zIndex:3,
        borderWidth:0.1,
    },
    conteiner: {
        position:'absolute',
        width: '100%',
        height: '8%',
        top:771,
        backgroundColor:'rgb(71, 103, 151)',
        borderWidth:0.5,
    },
    containerAnser:{
    },
    buttonPlacement:{
        flex:1,
        padding:2,
        justifyContent:'space-between',
        alignItems:'center',
        
        //borderColor:'red',
        //borderWidth:2
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