import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const getUserReport = async(token:string) => {
    try{
        const res = await axios.get(`${API}/admin/reports`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return res
    }catch(err){
        console.log(err);
    }
}

export const createReport = async (report: string, token: string) => {
    try{
        const res = axios.post(`${API}/reports`, report, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return res
    }catch(err){
        console.log(err);
    }
}