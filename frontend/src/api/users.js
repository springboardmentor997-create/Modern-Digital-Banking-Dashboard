import axiosClient from "../utils/axiosClient";

export const getUsers = async () => {
    try{
        const {data} = await axiosClient.get('/user/');
        return data;
    } catch (error) {
    throw error.response?.data?.detail || error.message;
  }
};