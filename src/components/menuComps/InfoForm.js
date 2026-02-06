import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function InfoForm({logType, log}) {

    //const [serverState, setServerState] = useState(false);
    const [showPanel, setShowPanel] = useState(false);    

    const LogReader = ()=>{
            if(log === null) return;

           return (log.map(log=>(
                <View style={{flexDirection:'row'}}>
                    <Text style={{fontSize:15, marginLeft:10,}}>
                        {formatDate(log.createdAt)}
                        
                    </Text>
                    <Text style={{fontSize:15, marginLeft:10,fontWeight:600,}}>
                      {log.message}
                    </Text>
                </View>
            )))
        }
    const formatDate = (isoDate) =>{
        const date = new Date(isoDate);
        const dateString =  date.toLocaleString('ru-Ru',{
            day: '2-digit',
            month: '2-digit',
            //year:'numeric',
            hour:'2-digit',
            minute:'2-digit',
        });
        const clearDate = dateString.replace(',',''); //заебала запятая )
        return clearDate;
    };

    return(
        <View style={{
                alignItems:'center',
               
                borderColor:'rgba(0,0,0,0.0)',
                borderWidth:5, 
                minHeight:'5%'
                
                //maxHeight:"6%",

               
                }}>
                <View style={styles.main}>
                    <View style={styles.conteiner}>
                        <View style={[styles.circle,{
                            backgroundColor: logType ? 'green' : 'red'
                        }]}/>
                            <View style={{
                                    //borderColor:'red',borderWidth:1,
                                    flex:1,zIndex:10
                                    }}>
                                <Pressable 
                                    style={{
                                       //borderColor:'green',borderWidth:1,
                                        justifyContent:'center',
                                       
                                        flex:1,}} 
                                    onPressOut={()=>{setShowPanel(!showPanel)}}
                                >
                                    <Text style={{
                                         marginLeft:'10%',
                                    }}>
                                        {logType}
                                    </Text>
                                </Pressable>
                            </View>
                        
                        
                        
                    </View>
                    {showPanel &&
                    <View style={styles.infoMain}>
                        <View style={styles.infoConteiner}>
                            <LogReader />
                        </View>
                    </View>
                    }
                    

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    main:{
        //minHeight:"4%",
        //height:"100%",
        width:'90%',
        borderWidth:1,
        borderColor:'rgb(43,75,123)',
       //borderColor:'yellow',
       alignItems:'center',
        
    },
    circle:{
        height:'20',
        width:'20',
        //backgroundColor:'red',
        borderRadius:'50%',
        margin:4,
        //borderWidth:2,
       
        
    },
    conteiner:{
        height:"40",
        //height:"100%",
        width:'100%',
        backgroundColor:'rgb(73,106,154)',
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        
        borderWidth:1,
        borderColor:'rgb(43,75,123)',
        //borderColor:'green',
        
    },

    infoMain:{
        
        width:'100%',
        borderWidth:1,
        borderColor:'rgb(43,75,123)',
        
    },
    infoConteiner:{
        
        backgroundColor:'rgb(73,106,154)',
        flexDirection:'column',
        justifyContent:'flex-start',
        

        //borderColor:'yellow',
        //borderWidth:1,
    }
})
