import ShowHideColums from "./ShowHideColums"
import { useSearchParams } from "react-router-dom"
import ZakazNavigate from "./ZakazNavigate";

const ZakazFilter = () => {
    const [searchParams] = useSearchParams();
    console.log("searchParams", searchParams);
    
  return (
    <div>
        {/* <ZakazNavigate /> */}
        {/* <ShowHideColums /> */}
        
    </div>
  )
}

export default ZakazFilter