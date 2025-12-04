import { useTabContext } from "../../contexts/useTabContext";
import GeneralInformation from "./external-database/GeneralInformation";
import Population from "./population/Population";
import Clinical from "./clinical/Clinical";
import PredictedEffect from "./predicted-effect/PredictedEffect";
import Functional from "./functional/Functional";
import Gene from "./gene/Gene";
import Summary from "./summary/Summary";
import AuditTrail from "./audit-trail/AuditTrail";
import Literature from "./literature/Literature";

const TabContent = () => {
  const { activeTab } = useTabContext();

  const renderTabContent = () => {
    switch (activeTab) {
      case "general-information":
        return <GeneralInformation />
      case "population":
        return <Population />
      case "clinical":
        return <Clinical />
      case "predicted-effect":
        return <PredictedEffect />
      case "functional":
        return <Functional />
      case "gene":
        return <Gene />
      case "summary":
        return <Summary />
      case "audit-trail":
        return <AuditTrail />
      case "literature-for-variant":
        return <Literature />
      default:
        return <PredictedEffect />
    }
  }

  return <div className="space-y-6">{renderTabContent()}</div>;
}

export default TabContent;
