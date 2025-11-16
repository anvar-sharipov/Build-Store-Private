import { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import myAxios from "../../axios";
import { useSearchParams } from "react-router-dom";
import { DateContext } from "../../UI/DateProvider";
import { useLocation } from "react-router-dom";

const DetailReport6062Partner = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { dateFrom, dateTo } = useContext(DateContext);

  const location = useLocation();
  const { partner_id, account_id } = location.state || {};


  console.log("partner_id", partner_id);
  console.log("account_id", account_id);
  

  return (
    <div>
      DetailReport6062Partner
      <div>{partner_id}</div>
      <div>{account_id}</div>
    </div>
  );
};

export default DetailReport6062Partner;
