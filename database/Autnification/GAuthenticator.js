import { useEffect } from "react";
import { View,Text } from "react-native";


export default function GAuthenticator() {
    useEffect(()=>{
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if(code){
            console.log("Got the code:", code);

            fetch("http://localhost:5000/api/auth/google",{
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({code}),
            })
             .then(res => res.json())
             .then(data => console.log("Token:", data))
             .catch(err => console.error(err));
        }
    },[]);
    return (
        <View style={{
            flex:1,
            justifyContent:'center',
            alignItems:'center',
        }}> 
            <Text style={{
                fontSize:20,
                fontWeight:600,
            }}>
                Big G Authentication 
            </Text>
        </View>
    )
}