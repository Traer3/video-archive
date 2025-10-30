import { View, StyleSheet, Pressable } from "react-native"



export default function Menu ({areaState}) {

    const onAreaPress = () => {
        console.log("used")
        areaState(false)
    }

    return(
        <View style={styles.wrapper}>
            <Pressable style={styles.outerArea} onPress={onAreaPress}/>
            <View style={styles.conteiner}>

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper:{
        flex:1,
        position:'relative',
        
    },
    conteiner: {
        flex:1,
        width: 100,
        height: '10%',
        backgroundColor:'rgb(71, 103, 151)',
        //bottom:1,
    },
    outerArea:{
        position:'absolute',

        width:'100%',
        height:'100%',
        backgroundColor:'rgba(0,0,0,0.5)',
    }
})