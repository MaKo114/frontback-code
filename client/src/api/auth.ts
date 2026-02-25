import axios from "axios";

interface Token {
    token: string;
}

export const requiretUser = async(token: Token) =>
  await axios.post(
    "http://localhost:8000/require-user",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const requireAdmin = async(token: Token) => {
  return await axios.post(
    "http://localhost:8000/require-admin",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
