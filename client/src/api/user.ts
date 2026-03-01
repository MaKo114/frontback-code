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


export const blockUser = (token: string, student_id: number) => {
  return axios.put(
    `${import.meta.env.VITE_API_URL}/admin/block-user/${student_id}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const unblockUser = (token: string, student_id: number) => {
  return axios.put(
    `${import.meta.env.VITE_API_URL}/admin/unblock-user/${student_id}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};