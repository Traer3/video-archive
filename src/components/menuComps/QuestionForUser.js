import { View, StyleSheet, Pressable, Text, TextInput } from "react-native"


export default function QuestionForUser ({answer,setUserInput, userInput, userAnswer}) {
    return(
        <>
        {answer && 
            <View style={styles.answer}>
                <Text style={styles.textStyle}>
                    Enter url here
                </Text>
                <TextInput 
                    style={styles.answerInput}
                    numberOfLines={1} 
                    ellipsizeMode="tail"
                    value={userInput}
                    onChangeText={setUserInput}
                />
                <View style={{width:'90%', height:'30%',marginTop:10,}}>
                    {userInput && 
                        <Pressable 
                            onPress={()=>{userAnswer()}} 
                            style={styles.sendButton}
                        >
                            <Text style={styles.textStyle}>Send Code</Text>
                        </Pressable>
                    }
                </View>
                
            </View>
        }
        </>
    )
}
const styles = StyleSheet.create({
    textStyle:{
        fontSize:18, 
        fontWeight:'600',
        //borderColor:'green', 
        //borderWidth:2,
    },
    answer:{
        position:'absolute',
        width: '80%',
        height: '15%',
        top:450,
        marginLeft:"10%",
        backgroundColor:'rgb(71, 103, 151)',
        //backgroundColor:'red',
        borderColor:'rgb(43,75,123)',
        borderWidth:2,
        borderRadius: 2,
        alignItems:'center',
        zIndex:10,
    },
    answerInput:{
        width:'90%', 
        height:'40%', 
        backgroundColor:'rgba(0,0,0,0.3)', 
        borderColor:'rgb(43,75,123)', 
        borderWidth:2, 
        borderRadius: 2, 
    },
    sendButton:{
        width:'100%', height:'100%',
        justifyContent:'center',
        alignItems:'center',
        //borderColor:'yellow', 
        //borderWidth:2, 
    }
})