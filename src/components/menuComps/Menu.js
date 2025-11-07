import { View, StyleSheet, Pressable, Text } from "react-native"
import ToolButton from "../buttons/ToolButton"
import { useEffect, useState } from "react"
import GAuthenticator from "../../../database/Autnification/GAuthenticator";



export default function Menu ({areaState}) {
    const [authorized,setAuthorized] = useState(false); //будем передовать в компонент для авторизации
    const [logout, setLogout] = useState(false);
    const [question, setQuestion] = useState(false);
    const [autnification,setAutnification] = useState(false);

    useEffect(()=>{
        const getServer = async () => {
            try{
                const responce = await fetch("http://192.168.0.8:3004/authorize");
                const text = await responce.text();
                console.log(text);
            }catch(err){
                console.log("Server error:", err)
            }
        }
        getServer();
    },[])
    
    
    const onLogout = () => {
        
        setLogout(!logout);
        setQuestion(true)
    }
    const onAuthorize = () => {
        setAuthorized(!authorized)
        setAutnification(true);
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


    return(
        <View style={styles.wrapper}>
            <Pressable 
                onPress={onAreaPress} 
                style={{
                    //borderColor:'green',
                    //borderWidth:2,
                    flex:1,
                    position:'absolute',
                    width: '100%',
                    height: '92%',
                    }}>
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
            </Pressable>
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
        //borderColor:'green',
        //borderWidth:2
    },
    conteiner: {
        width: '100%',
        height: '8%',
        top:771,
        backgroundColor:'rgb(71, 103, 151)',
        //backgroundColor:'rgb(255, 255, 0)',
        //borderColor:'yellow',
        //borderWidth:2
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
        
        //borderColor:'red',
        //borderWidth:2
    },
    outerArea:{
        width:'100%',
        height:'100%',
        backgroundColor:'rgba(0,0,0,0.5)', // затемнение , а не прозрачность 
       // borderColor:'red',
       // borderWidth:2
    }
})