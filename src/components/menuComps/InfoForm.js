import { Pressable, StyleSheet, Text, View } from "react-native";

export default function InfoForm() {
    return(
        <View style={styles.main}>
            <View style={styles.conteiner}>
                <View style={styles.circle}/>
                <Pressable style={{borderColor:'green',borderWidth:1,flex:1,}}>
                    <View style={{borderColor:'red',borderWidth:1,flex:1,}}>
                        <Text>
                            Zalupa
                        </Text>
                    </View>
                </Pressable>
                
                
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    main:{
        height:"5%",
        width:'90%',
        marginTop:10,
        borderWidth:2,
        borderColor:'rgb(43,75,123)',
    },
    circle:{
        height:'100%',
        width:'10%',
        backgroundColor:'red',
        borderRadius:'50%',
        
        
    },
    conteiner:{
        flex:1,
        backgroundColor:'rgb(73,106,154)',
        flexDirection:'row',
    },
})
