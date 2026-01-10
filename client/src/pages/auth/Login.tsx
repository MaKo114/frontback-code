import { useEffect } from "react";

const Login = () => {

  useEffect(() => {
    document.title = "เข้าสู่ระบบ";
  }, []);
  
  return <div>Login</div>;
};

export default Login;
