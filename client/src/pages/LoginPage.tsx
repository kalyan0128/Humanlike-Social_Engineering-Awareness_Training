import AuthPage from "@/components/auth/AuthPage";
import { Helmet } from "react-helmet";

const LoginPage = () => {
  return (
    <>
      <Helmet>
        <title>Login | HumanLike-AwareBot</title>
      </Helmet>
      <AuthPage initialView="login" />
    </>
  );
};

export default LoginPage;
