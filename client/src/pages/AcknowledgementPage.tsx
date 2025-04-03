import AcknowledgementPageComponent from "@/components/acknowledgement/AcknowledgementPage";
import { Helmet } from "react-helmet";

const AcknowledgementPage = () => {
  return (
    <>
      <Helmet>
        <title>Acknowledgement | HumanLike-AwareBot</title>
      </Helmet>
      <AcknowledgementPageComponent />
    </>
  );
};

export default AcknowledgementPage;
