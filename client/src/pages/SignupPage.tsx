import AuthPage from "@/components/auth/AuthPage";
import { Helmet } from "react-helmet";

const SignupPage = () => {
  return (
    <>
      <Helmet>
        <title>Sign Up | HumanLike-AwareBot</title>
      </Helmet>
      <AuthPage initialView="signup" />
    </>
  );
};

export default SignupPage;
