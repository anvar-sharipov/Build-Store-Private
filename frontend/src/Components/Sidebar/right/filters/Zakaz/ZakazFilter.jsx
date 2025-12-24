import ShowHideColums from "./ShowHideColums"
import { useSearchParams } from "react-router-dom"

const ZakazFilter = () => {
    const [searchParams] = useSearchParams();
    console.log("searchParams", searchParams);
    
  return (
    <div>
        <ShowHideColums />
    </div>
  )
}

export default ZakazFilter