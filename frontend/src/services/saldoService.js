import myAxios from "../Components/axios";

export const getSaldoForPartner = async (partnerId, dateFrom, dateTo, values, use_diapazon = false) => {
  console.log("use_diapazon", use_diapazon);

  if (use_diapazon) {
    if (!dateFrom || !dateTo || !partnerId) return;

    try {
      const response = await myAxios.get("get_saldo_for_partner_for_selected_date2", {
        params: { partnerId, dateFrom, dateTo, use_diapazon  },
      });
      return response.data.saldo;
    } catch (error) {
      console.error("error get_saldo_for_partner_for_selected_date2 from saldoService", error);
      throw error; // чтобы можно было ловить ошибку в компоненте
    }
  } else {
    if (!values) return;
    let invoice_date = null;
    if (values.id) {
      invoice_date = values.invoice_date2;
    } else {
      invoice_date = values.invoice_date;
    }
    if (!invoice_date) return;

    try {
      const response = await myAxios.get("get_saldo_for_partner_for_selected_date2", {
        params: { partnerId, dateFrom, dateTo, invoice_date },
      });
      return response.data.saldo;
    } catch (error) {
      console.error("error get_saldo_for_partner_for_selected_date2 from saldoService", error);
      throw error; // чтобы можно было ловить ошибку в компоненте
    }
  }
};
