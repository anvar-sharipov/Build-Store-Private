import myAxios from "../Components/axios";



export const getSaldoForPartner = async (date, partnerId) => {
  try {
    const response = await myAxios.get(
      "get_saldo_for_partner_for_selected_date2",
      {
        params: { date, partnerId },
      }
    );
    return response.data.saldo;
  } catch (error) {
    console.error(
      "error get_saldo_for_partner_for_selected_date2 from saldoService",
      error
    );
    throw error; // чтобы можно было ловить ошибку в компоненте
  }
};