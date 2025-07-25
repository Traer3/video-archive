import { Pressable ,Text } from "react-native"

export default function CustomButton({buttonSetState, buttonState}){
    //rgb(73,106,154) цвет кнокпи 
    // rgb(43,75,123) цвет рамки 
    // rgb(178,191,217) цвет текста 
    return(
        <Pressable
            onPress={()=>buttonSetState(!buttonState)}
            style={{
                borderRadius:2,
                borderWidth:1,
                borderColor:'rgb(43,75,123)',
                backgroundColor:'rgb(73,106,154)',
                padding:2,
                //width:60,
                //height:10,
                //overflow:'hidden'
            }}
        >
            <Text style={{color:'rgb(198, 212, 240)'}}>never kys</Text>
        </Pressable>
    )
}