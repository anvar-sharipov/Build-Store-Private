// import { useLoadOptions } from "./useLoadOptions";

// const { fetchs, loading } = useLoadOptions();

// const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

const defaultInitialValues = (fetchs) => ({
  invoice_date: new Date().toISOString().slice(0, 10),
  awto: {},
  partner: {},
  warehouses: {
    id: fetchs.AllWarehouses[0]?.id || null,
    name: fetchs.AllWarehouses[0]?.name || "",
  },
  products: [],
  gifts: [],
  priceType: (() => {
    try {
      const saved = localStorage.getItem("priceType");
      return saved ? JSON.parse(saved) : "wholesale";
    } catch {
      return "wholesale";
    }
  })(),
});



export default defaultInitialValues