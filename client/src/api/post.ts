import axios from "axios";

export const creatPost = async (token: string, data) => {
  try{
    const res = axios.post(`${import.meta.env.VITE_API_URL}/create-post`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return res
  }catch(err){
    console.log(err);
    
  }
}

export const getAllPost = async(token: string) => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/get-all-post`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res
  } catch (err) {
    console.log(err);
  }
};


export const getPostByCategory = async (token:string, category_id: number) => {
    try{
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/post-by-category/${category_id}`, {
            headers:{
                Authorization: `Bearer ${token}`
            }
        })
        return res
    }catch(err){
        console.log(err); 
    }
}

export const uploadFile = (token: string, image: string) => {
  return axios.post(
    `${import.meta.env.VITE_API_URL}/upload-image`,
    { image },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};