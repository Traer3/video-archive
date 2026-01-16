import { Image, View } from "react-native"
import ArPl from "../../assets/server.gif"

export default function ServerLoading () {
    return(
            <View style={{
                    height:'100%',
                    width:'100%',
                    justifyContent:'center',
                    alignItems:'center',
                    backgroundColor:'white',
                }}>
                    <Image
                        source={ArPl}
                        style={{height:'19%'}}
                        resizeMode="contain"
                    />
            </View>       
    )
}