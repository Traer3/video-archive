import { View, StyleSheet, Text } from "react-native"
export default function SidePanel({children}){
   
    return(
        <View style={styles.wrapper}>
            <View 
                style={styles.conteiner}> 
                    <View style={styles.panel}>
                        {children}
                    </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({

    wrapper:{
        flex:1,
        paddingTop:200,
        flexDirection:'column-reverse',
        zIndex:2,
        //borderColor:'red',
        //borderWidth:2,
    },

    panel:{
        flex:1,
        borderRadius:2,
        borderWidth:1,
        borderColor:'rgb(43,75,123)',
        backgroundColor:'rgb(73,106,154)',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:"space-between",
        padding:10,
        
        //borderWidth:2,
        //borderColor:'green',
    },
    conteiner:{
        flex:0.1,
        flexDirection:'column-reverse',

        //borderColor:'yellow',
        //borderWidth:2,
    }
})

/*
panel:{
        flex:1,
        position:'absolute',
        borderRadius:2,
        //borderWidth:1,
        //borderColor:'rgb(43,75,123)',

        borderWidth:2,
        borderColor:'green',

        backgroundColor:'rgb(73,106,154)',
        width:'100%',
        height:'8%',
        bottom:0,
       
        padding:10,
        
        flexDirection:'row',
        alignItems:'center',
        justifyContent:"space-between"
        
    },
*/