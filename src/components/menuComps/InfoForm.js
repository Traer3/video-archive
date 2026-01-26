import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function InfoForm() {

    const [serverState, setServerState] = useState(false);
    const [showPanel, setShowPanel] = useState(false);

    return(
        <View style={{alignItems:'center',marginTop:10,borderColor:'purple',borderWidth:1, height:'50%'}}>
                <View style={styles.main}>
                    <View style={styles.conteiner}>
                        <View style={[styles.circle,{
                            backgroundColor: serverState ? 'green' : 'red'
                        }]}/>
                            <View style={{borderColor:'red',borderWidth:1,flex:1,zIndex:10}}>
                                <Pressable 
                                    style={{borderColor:'green',borderWidth:1,flex:1,}} 
                                    onPressOut={()=>{setShowPanel(!showPanel)}}
                                >
                                    <Text>
                                        process name
                                    </Text>
                                </Pressable>
                            </View>
                        
                        
                        
                    </View>
                    {showPanel &&<View style={styles.infoMain}>
                        <View style={styles.infoConteiner}>
                            <Text>
                                server logs
                            </Text>
                        </View>
                    </View>}

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    main:{
        //minHeight:"4%",
        width:'90%',
        borderWidth:1,
        borderColor:'rgb(43,75,123)',
        
    },
    circle:{
        height:'100%',
        width:'5%',
        //backgroundColor:'red',
        borderRadius:'50%',
        margin:2,
        //borderWidth:2,
        
    },
    conteiner:{
        minHeight:"5%",
        width:'100%',
        backgroundColor:'rgb(73,106,154)',
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        borderWidth:1,
        borderColor:'rgb(43,75,123)',
    },

    infoMain:{
        
        width:'100%',
        borderWidth:1,
        borderColor:'rgb(43,75,123)',
    },
    infoConteiner:{
        
        backgroundColor:'rgb(73,106,154)',
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',

        //borderColor:'yellow',
        //borderWidth:1,
    }
})
