import axios from "axios"

const API = "http://localhost:8000";

export const getCommentAPI = async (token: string, post_id: number) => {
    return await axios.get(`${API}/posts/${post_id}/comments`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}
export const inputCommentAPI = async (token: string, post_id: number, text: string) => {
    return await axios.post(`${API}/posts/${post_id}/comments`,
        { text }, 
        {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}
export const editCommentAPI = async (token: string, comment_id: number, text: string) => {
    return await axios.put(`${API}/comments/${comment_id}`,
        { text }, 
        {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}
export const deleteCommentAPI = async (token: string, comment_id: number) => {
    return await axios.delete(`${API}/comments/${comment_id}`,
        {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}

