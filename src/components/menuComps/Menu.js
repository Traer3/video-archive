import { View, StyleSheet, Pressable } from "react-native"
import ToolButton from "../buttons/ToolButton"
import { useState } from "react"



export default function Menu ({areaState}) {
    const [authorized,setAuthorized] = useState(false); //будем передовать в компонент для авторизации
    const [logout, setLogout] = useState(false);
    
    const onLogout = () => {
        alert('by by')
        setLogout(!logout);
    }
    const onAuthorize = () => {
        alert('click more')
        console.log('click more')
        setAuthorized(!authorized)
    }

    const onAreaPress = () => {
        console.log("used")
        areaState(false)
    }


    return(
        <View style={styles.wrapper}>
            <View style={styles.conteiner}>
                <View style={styles.buttonPlacement}>
                    
                    {authorized ? 
                        (
                            <ToolButton buttonFunction={onLogout} iconName={logout ? 'deleteButton' : 'checkButton'} />
                        ): (
                            <ToolButton buttonFunction={onAuthorize} iconName={'more'} />
                        )}
                                
                                    
                                    


                    

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
        //borderColor:'green',
        //borderWidth:2
    },
    conteiner: {
        width: '100%',
        height: '8%',
        top:765,
        backgroundColor:'rgb(71, 103, 151)',
        //backgroundColor:'rgb(255, 255, 0)',
        //borderColor:'yellow',
        //borderWidth:2
    },
    buttonPlacement:{
        flex:1,
        padding:10,
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