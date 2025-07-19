import { View } from "react-native"


export default function SidePanel({children}){
    return(
        <View
            style={{
                position:'absolute',
                borderRadius:2,
                borderWidth:1,
                borderColor:'rgb(43,75,123)',
                backgroundColor:'rgb(73,106,154)',
                width:'20%',
                height:'95%',
                top:30,
                left:1,
            }}
        >
            {children}
        </View>
    )
}