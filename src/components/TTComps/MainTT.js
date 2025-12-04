import { StyleSheet } from "react-native";
import { View } from "react-native";




export default function MainTT () {
        return(
            <View
                style={styles.main}
            >

            </View>
        );
};

const styles = StyleSheet.create({
    main:{
        position:'absolute',
        width:'100%',
        height: '92%',
        backgroundColor:'rgb(71, 103, 151)',

        borderWidth:1,
        borderColor:'red'

    }
})