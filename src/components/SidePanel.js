import { View, StyleSheet } from "react-native"
export default function SidePanel({children}){
   
    return(
        <View style={styles.wrapper}>
            <Text style={{}}>zindex 0</Text>
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
        zIndex:0,
        borderColor:'red',
        borderWidth:2
    },

    panel:{
        flex:1,
        position:'absolute',
        borderRadius:2,
        borderWidth:1,
        borderColor:'rgb(43,75,123)',
        backgroundColor:'rgb(73,106,154)',
        width:'100%',
        height:'8%',
        bottom:0,
       
        padding:10,
        
        flexDirection:'row',
        alignItems:'center',
        justifyContent:"space-between"
        
    },
    conteiner:{
        flex:1,

       // borderColor:'yellow',
        //borderWidth:2
    }
})