import axios from "axios";


export const getAllUser = async(token: string) => {
    try{
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
        headers:{
            Authorization: `Bearer ${token}`
        }
    })
    return res
    
    }catch(err){
        console.log(err);
    }
}
