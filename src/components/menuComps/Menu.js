import { View, StyleSheet, Pressable } from "react-native"
import ToolButton from "../buttons/ToolButton"
import { useState } from "react"



export default function Menu ({areaState}) {
    const [authorized,setAuthorized] = useState(false); //будем передовать в компонент для авторизации
    const [logout, setLogout] = useState(false);
    
    const onAuthorize = () => {
        setLogout(!logout);
    }
    const onAreaPress = () => {
        console.log("used")
        areaState(false)
    }

    return(
        <View style={styles.wrapper}>
            {//<Pressable style={styles.outerArea} onPress={onAreaPress}/>
            }
                <View style={styles.conteiner}> 
                    <View style={styles.buttonPlacement}>
                        <Pressable onPress={onAuthorize}>
                            {authorized ? 
                                (<ToolButton iconName={'deleteButton'}/>)
                                :
                                (<ToolButton iconName={authorized ? 'checkButton' : 'more'}/>)
                            }
                        </Pressable>
                    </View>
                </View>
            
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper:{
        position:'absolute',
        width:'100%',
        height:'100%',
        //borderWidth:0.1,
        //borderColor:'green',
        //borderWidth:2
    },
    conteiner: {
        position:'absolute',
        width: '100%',
        height: '8%',
        bottom:70,
        backgroundColor:'rgb(71, 103, 151)',
        //backgroundColor:'rgb(255, 255, 0)',
        //borderColor:'yellow',
        //borderWidth:2
    },
    buttonPlacement:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        height:'100%',
        width:'100%',
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