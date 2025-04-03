import Dashboard from "@/components/dashboard/Dashboard";
import { Helmet } from "react-helmet";

const DashboardPage = () => {
  return (
    <>
      <Helmet>
        <title>Dashboard | HumanLike-AwareBot</title>
      </Helmet>
      <Dashboard />
    </>
  );
};

export default DashboardPage;
