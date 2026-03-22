import { useEffect, useRef, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Trash2, Package, DollarSign, ChevronDown, Image, FolderOpen, Warehouse, Download, FileSpreadsheet } from "lucide-react";
import { myFormatNumber } from "../../../UI/myFormatNumber";
import { AuthContext } from "../../../../AuthContext";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ROUTES_RAPORT } from "../../../../routes";
import { formatNumber2 } from "../../../UI/formatNumber2";
import MyModal2 from "../../../UI/MyModal2";
import myAxios from "../../../axios";
import { DateContext } from "../../../UI/DateProvider";
import { useSearchParams } from "react-router-dom";
import MyFormatDate from "../../../UI/MyFormatDate";

const minusOneDay = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d;
};

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

const ProductList = ({
  myClass,
  products,
  listItemRefs,
  nextPageUrl,
  loading,
  fetchProducts,
  t,
  searchInputRef,
  setClickedNextPageBtn,
  clickedNextPageBtn,
  productEditModal,
  productEditModal2,
  setProductEditModal2,
  setOpenDeleteModal,
}) => {
  const loadMoreButtonRef = useRef(null);

  const { authUser, authGroup } = useContext(AuthContext);
  const [productTurnOverModal, setProductTurnOverModal] = useState({ open: false, id: null });
  const { dateFrom, dateTo, dateProwodok } = useContext(DateContext);
  const [warheousesId, setWarehousesId] = useState(null);
  const [detailOborot, setDetailOborot] = useState(null);
  const [selectedWarehouses, setSelectedWarehouses] = useState([]);

  const [searchParams] = useSearchParams();

  const dFrom = searchParams.get("date_from");
  const dTo = searchParams.get("date_to");
  const warehouseTest = searchParams.get("warehouse");

  // console.log("products", products);

  // console.log("dFrom", dFrom);
  // console.log("dTo", dTo);
  // console.log("warehouse", warehouseTest);

  useEffect(() => {
    const warehouse = searchParams.get("warehouse");
    if (!warehouse) return;
    // console.log("rerere", warehouse.split(","));

    setWarehousesId(warehouse);
    setSelectedWarehouses(warehouse.split(","));
  }, [searchParams]);

  // const location = useLocation();
  // const navigate = useNavigate();

  // const showDetailProductOborot = (productId) => {
  //   const params = new URLSearchParams(location.search);
  //   params.set("selected", productId);
  //   navigate(ROUTES_RAPORT.DETAIL_PRODUCT_OBOROT.replace(":id", productId).replace(":warehouseId", warehouseId));
  // };
  // console.log("products", products);

  const sound_up_down = new Audio("/sounds/up_down.mp3");

  const handleExportExcel = async (productId) => {
    try {
      const response = await myAxios.get("/download_product_turnover_excel/", {
        params: {
          product_id: productId,
          dateFrom,
          dateTo,
          warheousesId,
        },
        responseType: "blob", // ⚠ ОБЯЗАТЕЛЬНО
      });

      // создаём ссылку для скачивания
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", `product_turnover_${productId}.xlsx`);

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Excel download error:", error);
    }
  };

  useEffect(() => {
    console.log("tut");

    if (!productTurnOverModal.id) {
      return;
    }
    // console.log("tut2");
    const fetchProductHistory = async () => {
      try {
        const res = await myAxios.get(`get_product_turnover_history`, {
          params: {
            product_id: productTurnOverModal.id,
            dateFrom,
            dateTo,
            warheousesId,
          },
        });

        // console.log("res", res.data.data);
        setDetailOborot(res.data.data);
      } catch (error) {
        console.log("Error fetching product history:", error);
      } finally {
      }
    };

    fetchProductHistory();
  }, [productTurnOverModal.open]);

  const handleOpenInvoice = async (id) => {
    const url = id ? `/purchase-invoices/update/${id}` : ROUTES.PURCHASE_INVOICE_CREATE;
    window.open(url, "invoiceWindow", "width=1000,height=700,scrollbars=yes,resizable=yes");
  };

  // const handleExportExcel = () => {
  //   const downloadProductTurnoverExcel = async () => {
  //     console.log("warheousesId", warheousesId);

  //     try {
  //       const res = await myAxios.get(`product_turnover_excel`, {
  //         params: {
  //           product_id: detailOborot.product_id,
  //           dateFrom,
  //           dateTo,
  //           warheousesId,
  //         },
  //       });
  //     } catch (err) {
  //       console.log("Error downloading Excel:", err);
  //     } finally {
  //     }
  //   };
  //   downloadProductTurnoverExcel();
  //   // window.open(`${BASE_URL}/products/turnover-excel/?product_id=${detailOborot.product_id}&date_from=${dateFrom}&date_to=${dateTo}`, "_blank");
  // };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
      <div className="p-2 print:hidden">
        <ul className="space-y-1.5">
          <AnimatePresence>
            {products.map((p, index) => {
              let unit_name = p.base_unit_obj.name;
              // console.log("p", p);
              
              // let quantity = parseFloat(p.quantity_on_selected_warehouses || p.total_quantity || 0);
              let quantity = parseFloat(p.quantity_on_selected_warehouses || 0);
              const currency = p.warehouses_data[0].warehouse_currency;

              // console.log("ppppawqwd", p);

              if (p.units.length > 0) {
                p.units.forEach((u) => {
                  if (u.is_default_for_sale) {
                    unit_name = u.unit_name;
                    quantity = quantity / parseFloat(u.conversion_factor);
                  }
                });
              }

              return (
                <motion.li
                  key={p.id}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.15, delay: index * 0.01 }}
                  className="group relative bg-white dark:bg-gray-900 rounded-lg p-2 
                    hover:bg-blue-50 dark:hover:bg-blue-950/20
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 focus:bg-blue-50 dark:focus:bg-blue-950/30
                    transition-all duration-200 cursor-pointer border border-gray-100 dark:border-gray-800
                    hover:border-blue-200 dark:hover:border-blue-800
                    shadow-xs hover:shadow-sm"
                  ref={(el) => (listItemRefs.current[index] = el)}
                  tabIndex={0}
                  onClick={() => listItemRefs.current[index]?.focus()}
                  onDoubleClick={() => {
                    // setProductEditModal2({ open: true, data: p, index });
                    setProductTurnOverModal({ open: true, id: p.id });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Delete" && authUser === "anvar") {
                      e.preventDefault();
                      setOpenDeleteModal({ open: true, data: p, index });
                    } else if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      // showDetailProductOborot(p.id)

                      setProductEditModal2({ open: true, data: p, index });
                    } else if (e.key === "ArrowDown" && index + 1 < products.length) {
                      e.preventDefault();
                      sound_up_down.currentTime = 0;
                      sound_up_down.play();
                      listItemRefs.current[index + 1]?.focus();
                    } else if (e.key === "ArrowUp" && index !== 0) {
                      e.preventDefault();
                      sound_up_down.currentTime = 0;
                      sound_up_down.play();
                      listItemRefs.current[index - 1]?.focus();
                    } else if (e.key === "ArrowUp" && index === 0) {
                      e.preventDefault();
                      sound_up_down.currentTime = 0;
                      sound_up_down.play();
                      searchInputRef.current?.focus();
                    } else if (e.key === "ArrowDown" && index + 1 === products.length) {
                      e.preventDefault();
                      sound_up_down.currentTime = 0;
                      sound_up_down.play();
                      loadMoreButtonRef.current?.focus();
                    }
                  }}
                >
                  {/* Mobile layout (< 640px) */}
                  <div className="sm:hidden">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{index + 1}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">{p.name}</h3>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded text-xs">
                              <Package className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              <span className="font-medium text-amber-700 dark:text-amber-300">{myFormatNumber(quantity, 0)}</span>
                            </div>

                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded text-xs">
                              <span className="font-medium text-emerald-700 dark:text-emerald-300">{myFormatNumber(p.retail_price)}</span>
                            </div>

                            {p.category_name_obj?.name && (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded text-xs">
                                <FolderOpen className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                <span className="text-blue-700 dark:text-blue-300">{p.category_name_obj.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          className="p-1 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-950/50 rounded transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProductEditModal2({ open: true, data: p, index });
                          }}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </motion.button>

                        {authUser === "anvar" && (
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="p-1 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-950/50 rounded transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDeleteModal({ open: true, data: p, index });
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      {/* таблица тут */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-gray-300 border-collapse">
                          <thead>
                            <tr>
                              <th className="border border-gray-300 px-2 py-1 text-left font-normal" colSpan={2}>
                                Начало
                              </th>
                              <th className="border border-gray-300 px-2 py-1 text-left font-normal" colSpan={2}>
                                Оборот приход
                              </th>
                              <th className="border border-gray-300 px-2 py-1 text-left font-normal" colSpan={2}>
                                Оборот возврат
                              </th>
                              <th className="border border-gray-300 px-2 py-1 text-left font-normal" colSpan={2}>
                                Оборот расход
                              </th>
                              <th className="border border-gray-300 px-2 py-1 text-left font-normal" colSpan={2}>
                                Конец
                              </th>
                            </tr>
                            <tr>
                              <th className="border border-gray-300 px-2 py-1 text-left font-normal">кол-во</th>
                              <th className="border border-gray-300 px-2 py-1 text-left font-normal">цена</th>
                              <th className="border border-gray-300 px-2 py-1 text-left font-normal">кол-во</th>
                              <th className="border border-gray-300 px-2 py-1 text-left font-normal">цена</th>
                              <th className="border border-gray-300 px-2 py-1 text-left font-normal">кол-во</th>
                              <th className="border border-gray-300 px-2 py-1 text-left font-normal">цена</th>
                              <th className="border border-gray-300 px-2 py-1 text-left font-normal">кол-во</th>
                              <th className="border border-gray-300 px-2 py-1 text-left font-normal">цена</th>
                              <th className="border border-gray-300 px-2 py-1 text-left font-normal">кол-во</th>
                              <th className="border border-gray-300 px-2 py-1 text-left font-normal">цена</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-gray-300 px-2 py-1">{formatNumber2(p.turnover_data.start_quantity, 0)}</td>
                              <td className="border border-gray-300 px-2 py-1">{formatNumber2(p.turnover_data.start_quantity * p.turnover_data.price)}</td>

                              <td className="border border-gray-300 px-2 py-1 text-green-700 dark:text-green-400">{formatNumber2(p.turnover_data.turnover_quantity_prihod, 0)}</td>
                              <td className="border border-gray-300 px-2 py-1 text-green-700 dark:text-green-400">{formatNumber2(p.turnover_data.turnover_quantity_prihod * p.turnover_data.price)}</td>

                              <td className="border border-gray-300 px-2 py-1 text-red-700 dark:text-red-400">{formatNumber2(p.turnover_data.turnover_quantity_wozwrat, 0)}</td>
                              <td className="border border-gray-300 px-2 py-1 text-red-700 dark:text-red-400">{formatNumber2(p.turnover_data.turnover_quantity_wozwrat * p.turnover_data.price)}</td>

                              <td className="border border-gray-300 px-2 py-1 text-blue-700 dark:text-blue-400">{formatNumber2(p.turnover_data.turnover_quantity_rashod, 0)}</td>
                              <td className="border border-gray-300 px-2 py-1 text-blue-700 dark:text-blue-400">{formatNumber2(p.turnover_data.turnover_quantity_rashod * p.turnover_data.price)}</td>

                              <td className="border border-gray-300 px-2 py-1">{formatNumber2(p.turnover_data.qty_end, 0)}</td>
                              <td className="border border-gray-300 px-2 py-1">{formatNumber2(p.turnover_data.qty_end * p.turnover_data.price)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Tablet/Desktop layout (>= 640px) */}
                  <div className="hidden sm:flex justify-between sm:flex-col">
                    <div className="flex items-center gap-3 min-w-0 mx-auto w-full">
                      <div className="flex-shrink-0 w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">{index + 1}</span>
                      </div>

                      {p.images.length > 0 ? (
                        <img src={`${p.images[0].image}`} alt={p.images[0].alt_text || "Product image"} className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                          <Image className="w-5 h-5 text-gray-400" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{p.name}</h3>
                        {p.category_name_obj?.name && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <FolderOpen className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400 text-bold">{p.category_name_obj.name}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <Package className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span className="text-sm font-medium text-amber-700 dark:text-amber-300 whitespace-nowrap">
                            {myFormatNumber(quantity)} {unit_name}
                          </span>
                        </div>

                        {Number(p.qty_in_drafts) > 0 && (
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-lg">
                            {/* <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">{t("reserved")}</span> */}
                            <span
                              className="text-xs text-orange-600 dark:text-orange-400 font-medium"
                              title={p.reserved_details?.map((r) => `${t("faktura")} ${r.invoice_id}: ${myFormatNumber(r.qty)}`).join("\n")}
                            >
                              {t("reserved")}
                            </span>
                            <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">{myFormatNumber(p.qty_in_drafts)}</span>
                          </div>
                        )}

                        {Number(p.qty_in_drafts) > 0 && (
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{t("available")}</span>
                            <span className={`text-sm font-semibold ${quantity - p.qty_in_drafts <= 0 ? "text-red-600" : "text-green-600"}`}>{myFormatNumber(quantity - p.qty_in_drafts)}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            {formatNumber2(p.wholesale_price, 3)} {currency}
                          </span>
                        </div>

                        <div className="flex items-center gap-0.5">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProductEditModal2({ open: true, data: p, index });
                            }}
                          >
                            <Edit3 className="w-4 h-4" />
                          </motion.button>

                          {authUser === "anvar" && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDeleteModal({ open: true, data: p, index });
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto w-2/3 mx-auto">
                      <table className="w-full text-sm border border-gray-300 border-collapse">
                        <thead>
                          <tr>
                            <th className="border border-gray-300 px-2 py-1 text-left font-normal" colSpan={2}>
                              Начало
                            </th>
                            <th className="border border-gray-300 px-2 py-1 text-left font-normal" colSpan={2}>
                              Оборот приход
                            </th>

                            <th className="border border-gray-300 px-2 py-1 text-left font-normal" colSpan={2}>
                              Оборот возврат
                            </th>

                            <th className="border border-gray-300 px-2 py-1 text-left font-normal" colSpan={2}>
                              Оборот расход
                            </th>
                            <th className="border border-gray-300 px-2 py-1 text-left font-normal" colSpan={2}>
                              Конец
                            </th>
                          </tr>
                          <tr>
                            <th className="border border-gray-300 px-2 py-1 text-left font-normal">кол-во</th>
                            <th className="border border-gray-300 px-2 py-1 text-left font-normal">цена</th>
                            <th className="border border-gray-300 px-2 py-1 text-left font-normal">кол-во</th>
                            <th className="border border-gray-300 px-2 py-1 text-left font-normal">цена</th>
                            <th className="border border-gray-300 px-2 py-1 text-left font-normal">кол-во</th>
                            <th className="border border-gray-300 px-2 py-1 text-left font-normal">цена</th>
                            <th className="border border-gray-300 px-2 py-1 text-left font-normal">кол-во</th>
                            <th className="border border-gray-300 px-2 py-1 text-left font-normal">цена</th>
                            <th className="border border-gray-300 px-2 py-1 text-left font-normal">кол-во</th>
                            <th className="border border-gray-300 px-2 py-1 text-left font-normal">цена</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 px-2 py-1">{formatNumber2(p.turnover_data.start_quantity, 0)}</td>
                            <td className="border border-gray-300 px-2 py-1">{formatNumber2(p.turnover_data.start_quantity * p.turnover_data.price)}</td>

                            <td className="border border-gray-300 px-2 py-1 text-green-700 dark:text-green-400">{formatNumber2(p.turnover_data.turnover_quantity_prihod, 0)}</td>
                            <td className="border border-gray-300 px-2 py-1 text-green-700 dark:text-green-400">{formatNumber2(p.turnover_data.turnover_quantity_prihod * p.turnover_data.price)}</td>

                            <td className="border border-gray-300 px-2 py-1 text-red-700 dark:text-red-400">{formatNumber2(p.turnover_data.turnover_quantity_wozwrat, 0)}</td>
                            <td className="border border-gray-300 px-2 py-1 text-red-700 dark:text-red-400">{formatNumber2(p.turnover_data.turnover_quantity_wozwrat * p.turnover_data.price)}</td>

                            <td className="border border-gray-300 px-2 py-1 text-blue-700 dark:text-blue-400">{formatNumber2(p.turnover_data.turnover_quantity_rashod, 0)}</td>
                            <td className="border border-gray-300 px-2 py-1 text-blue-700 dark:text-blue-400">{formatNumber2(p.turnover_data.turnover_quantity_rashod * p.turnover_data.price)}</td>

                            <td className="border border-gray-300 px-2 py-1">{formatNumber2(p.turnover_data.qty_end, 0)}</td>
                            <td className="border border-gray-300 px-2 py-1">{formatNumber2(p.turnover_data.qty_end * p.turnover_data.price)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>

      {/* Load More Button */}
      {nextPageUrl && (
        <div className="p-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <motion.button
            ref={loadMoreButtonRef}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 
              disabled:bg-gray-400 disabled:cursor-not-allowed
              text-white text-sm font-medium rounded-lg 
              transition-all duration-200 flex items-center justify-center gap-2
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900"
            disabled={!nextPageUrl || loading}
            onClick={() => {
              setClickedNextPageBtn(true);
              fetchProducts(nextPageUrl);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                listItemRefs.current[products.length - 1].focus();
              } else if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setClickedNextPageBtn(true);
                fetchProducts(nextPageUrl);
              }
            }}
          >
            {/* {loading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Загрузка...</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>{t("loadMore")}</span>
              </>
            )} */}
          </motion.button>
        </div>
      )}
      {productTurnOverModal.open && detailOborot && (
        <div className="print:hidden">
          <MyModal2
            onClose={() => {
              setProductTurnOverModal({ open: false, id: null });
            }}
            widthVariant="wide"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="
        space-y-4
        rounded-xl
        border
        bg-white
        dark:bg-zinc-900
        border-zinc-200 dark:border-zinc-800
        p-4
        shadow-sm
      "
            >
              {/* ================= HEADER ================= */}
              {/* <div className="flex gap-4 items-start">
                <img
                  src={`${BASE_URL}${detailOborot?.image}`}
                  alt={detailOborot?.product_name}
                  className="
            w-20 h-20 object-contain
            rounded-lg
            border
            bg-white
            dark:bg-zinc-800
            border-zinc-200 dark:border-zinc-700
          "
                />

                <div className="flex-1 space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    <Package className="w-4 h-4" />
                    {detailOborot.product_name}
                  </div>

                  <div className="flex items-center gap-2">
                    <Warehouse className="w-4 h-4 opacity-60" />
                    <span>{detailOborot.warehouses[0]?.name}</span>
                    <div>
                      <span className="font-medium">Выбрано складов: {selectedWarehouses.length === 0 ? "Все" : selectedWarehouses.length}</span>
                      {selectedWarehouses.length > 0 && (
                        <div className="text-[10px] text-zinc-500 mt-1">
                          {selectedWarehouses.map((id, index) => (
                            <span key={id} className="mr-2">
                              {detailOborot.warehouses && detailOborot.warehouses[id] ? detailOborot.warehouses[id].name : `Склад ${id}`}
                              {index < selectedWarehouses.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <div>
                      <b>ID:</b> {detailOborot.product_id}
                    </div>
                    <div>
                      <b>{t("unit")}:</b> {detailOborot.product_unit}
                    </div>
                    <div>
                      <b>{t("wholesale_price")}:</b> {formatNumber2(detailOborot.product_wholesale_price)}
                    </div>
                    <div>
                      <b>{t("retail_price")}:</b> {formatNumber2(detailOborot.product_retail_price)}
                    </div>
                  </div>

                  <div className="pt-1 text-[11px] text-zinc-500">
                    {t("Period")}: {MyFormatDate(dateFrom)} – {MyFormatDate(dateTo)}
                  </div>

                  {selectedWarehouses.length > 1 && detailOborot.warehouses && (
                    <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                      <div className="font-medium text-[11px] mb-1">Данные по складам:</div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        {selectedWarehouses.map((whId) => {
                          const whData = detailOborot.warehouses[whId];
                          if (!whData) return null;

                          return (
                            <div key={whId} className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded">
                              <div className="font-medium">{whData.name}</div>
                              <div>Начало: {whData.start_quantity}</div>
                              <div>Приход: {whData.income_qty}</div>
                              <div>Расход: {whData.outcome_qty}</div>
                              <div className="text-blue-600">Возврат: {whData.return_qty}</div>
                              <div>Конец: {whData.end_quantity}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div> */}

              {/* ================= HEADER ================= */}
              <div className="flex justify-between items-start gap-6">
                {/* LEFT SIDE */}
                <div className="flex gap-4 items-start">
                  {/* IMAGE */}
                  <img
                    src={`${BASE_URL}${detailOborot?.image}`}
                    alt={detailOborot?.product_name}
                    className="
        w-20 h-20 object-contain
        rounded-xl
        border
        bg-white
        dark:bg-zinc-800
        border-zinc-200 dark:border-zinc-700
      "
                  />

                  {/* INFO */}
                  <div className="flex-1 space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                    {/* TITLE */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      <Package className="w-4 h-4" />
                      {detailOborot.product_name}
                    </div>

                    {/* WAREHOUSE */}
                    <div className="flex items-start gap-2">
                      <Warehouse className="w-4 h-4 opacity-60 mt-[2px]" />
                      <div>
                        <span className="font-medium">Выбрано складов: {selectedWarehouses.length === 0 ? "Все" : selectedWarehouses.length}</span>

                        {selectedWarehouses.length > 0 && (
                          <div className="text-[10px] text-zinc-500 mt-1">
                            {selectedWarehouses.map((id, index) => (
                              <span key={id}>
                                {detailOborot.warehouses?.[id]?.name || `Склад ${id}`}
                                {index < selectedWarehouses.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* GRID INFO */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      <div>
                        <b>ID:</b> {detailOborot.product_id}
                      </div>
                      <div>
                        <b>{t("unit")}:</b> {detailOborot.product_unit}
                      </div>
                      <div>
                        <b>{t("wholesale_price")}:</b> {formatNumber2(detailOborot.product_wholesale_price)}
                      </div>
                      <div>
                        <b>{t("retail_price")}:</b> {formatNumber2(detailOborot.product_retail_price)}
                      </div>
                    </div>

                    {/* PERIOD */}
                    <div className="pt-1 text-[11px] text-zinc-500">
                      {t("Period")}: {MyFormatDate(dateFrom)} – {MyFormatDate(dateTo)}
                    </div>
                  </div>
                </div>

                {/* RIGHT ACTION BUTTONS */}
                <div className="flex items-center gap-2">
                  {/* PRINT */}
                  <button
                    onClick={() => window.print()}
                    className="
        p-2
        rounded-lg
        text-zinc-500 dark:text-zinc-400
        hover:bg-zinc-100 dark:hover:bg-zinc-800
        hover:text-black dark:hover:text-white
        transition
      "
                    title="Print"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {/* EXCEL */}
                  <button
                    onClick={() => handleExportExcel(detailOborot.product_id)}
                    className="
        p-2
        rounded-lg
        text-emerald-600 dark:text-emerald-400
        hover:bg-emerald-50 dark:hover:bg-emerald-900/40
        hover:text-emerald-700 dark:hover:text-emerald-300
        transition
      "
                    title="Export to Excel"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ================= TABLE ================= */}
              <div className="overflow-x-auto">
                <table
                  className="
            w-full
            text-[14px]
            leading-tight
            border-collapse
            border
            border-zinc-200 dark:border-zinc-800
           
            tabular-nums
          "
                >
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      <th className="border px-2 py-1">№</th>
                      <th className="border px-2 py-1">{t("Date")}</th>
                      <th className="border px-2 py-1">{t("partner")}</th>
                      <th className="border px-2 py-1">{t("comment2")}</th>
                      <th className="border px-2 py-1 text-right">{t("Price")}</th>
                      <th className="border px-2 py-1 text-center" colSpan={2}>
                        {t("prihod")}
                      </th>
                      <th className="border px-2 py-1 text-center" colSpan={2}>
                        {t("wozwrat")}
                      </th>
                      <th className="border px-2 py-1 text-center" colSpan={2}>
                        {t("rashod")}
                      </th>
                      <th className="border px-2 py-1 text-center" colSpan={2}>
                        {t("Closing balance")}
                      </th>
                    </tr>
                    <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500">
                      <th className="border px-2 py-1"></th>
                      <th className="border px-2 py-1"></th>
                      <th className="border px-2 py-1"></th>
                      <th className="border px-2 py-1"></th>
                      <th className="border px-2 py-1"></th>
                      <th className="border px-2 py-1 text-right whitespace-nowrap">{t("quantity")}</th>
                      <th className="border px-2 py-1 text-right whitespace-nowrap">{t("total")}</th>
                      <th className="border px-2 py-1 text-right whitespace-nowrap">{t("quantity")}</th>
                      <th className="border px-2 py-1 text-right whitespace-nowrap">{t("total")}</th>
                      <th className="border px-2 py-1 text-right whitespace-nowrap">{t("quantity")}</th>
                      <th className="border px-2 py-1 text-right whitespace-nowrap">{t("total")}</th>
                      <th className="border px-2 py-1 text-right whitespace-nowrap">{t("quantity")}</th>
                      <th className="border px-2 py-1 text-right whitespace-nowrap">{t("total")}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* OPENING BALANCE */}
                    <tr className="bg-zinc-50 dark:bg-zinc-800 font-semibold">
                      <td className="border px-2 py-1"></td>
                      <td className="border px-2 py-1">
                        {t("Opening balance")} {MyFormatDate(minusOneDay(dateFrom))}
                      </td>
                      <td colSpan={9} className="border"></td>
                      <td className="border px-2 py-1 text-right whitespace-nowrap">{formatNumber2(detailOborot.start_quantity, 2)}</td>
                      <td className="border px-2 py-1 text-right whitespace-nowrap">{formatNumber2(detailOborot.start_quantity * detailOborot.product_wholesale_price)}</td>
                    </tr>

                    {/* ROWS */}
                    {detailOborot.rows &&
                      detailOborot.rows.map((r, i) => (
                        <tr
                          key={i}
                          className="
                  hover:bg-zinc-100
                  dark:hover:bg-zinc-800
                  transition
                  cursor-pointer
                "
                          onDoubleClick={() => handleOpenInvoice(r.invoice_id)}
                        >
                          <td className="border px-2 py-1">{i + 1}</td>
                          <td className="border px-2 py-1">
                            {MyFormatDate(r.date)} {r.invoice_id && `id: ${r.invoice_id}`}
                          </td>
                          <td className="border px-2 py-1">{r.partner || "-"}</td>
                          <td className="border px-2 py-1">{r.text || "-"}</td>
                          <td className="border px-2 py-1 text-right whitespace-nowrap">{formatNumber2(r.price)}</td>

                          <td className="border px-2 py-1 text-right text-green-700 dark:text-greed-400 whitespace-nowrap">{formatNumber2(r.income_qty, 2)}</td>
                          <td className="border px-2 py-1 text-right text-green-700 dark:text-greed-400 whitespace-nowrap">{formatNumber2(r.income_sum)}</td>

                          <td className="border px-2 py-1 text-right text-red-700 dark:text-red-400 whitespace-nowrap">{formatNumber2(r.return_qty, 2)}</td>
                          <td className="border px-2 py-1 text-right text-red-700 dark:text-red-400 whitespace-nowrap">{formatNumber2(r.return_sum)}</td>

                          <td className="border px-2 py-1 text-right text-blue-700 dark:text-blue-400 whitespace-nowrap">{formatNumber2(r.outcome_qty, 2)}</td>
                          <td className="border px-2 py-1 text-right text-blue-700 dark:text-blue-400 whitespace-nowrap">{formatNumber2(r.outcome_sum)}</td>

                          <td className="border px-2 py-1 text-right font-medium whitespace-nowrap">{formatNumber2(r.balance_qty, 2)}</td>
                          <td className="border px-2 py-1 text-right font-medium whitespace-nowrap">{formatNumber2(r.balance_sum)}</td>
                        </tr>
                      ))}

                    {/* TURNOVER */}
                    <tr className="bg-zinc-100 dark:bg-zinc-900 font-semibold">
                      <td className="border px-2 py-1"></td>
                      <td className="border px-2 py-1">{t("Total turnover")}</td>
                      <td colSpan={3} className="border"></td>
                      <td className="border px-2 py-1 text-right whitespace-nowrap">{formatNumber2(detailOborot.turnover?.income_qty || 0, 2)}</td>
                      <td className="border px-2 py-1 text-right whitespace-nowrap">{formatNumber2(detailOborot.turnover?.income_sum || 0)}</td>
                      <td className="border px-2 py-1 text-right text-blue-600 dark:text-blue-400 whitespace-nowrap">{formatNumber2(detailOborot.turnover?.return_qty || 0, 2)}</td>
                      <td className="border px-2 py-1 text-right text-blue-600 dark:text-blue-400 whitespace-nowrap">{formatNumber2(detailOborot.turnover?.return_sum || 0)}</td>
                      <td className="border px-2 py-1 text-right whitespace-nowrap">{formatNumber2(detailOborot.turnover?.outcome_qty || 0, 2)}</td>
                      <td className="border px-2 py-1 text-right whitespace-nowrap">{formatNumber2(detailOborot.turnover?.outcome_sum || 0)}</td>

                      <td colSpan={2} className="border"></td>
                    </tr>

                    {/* END BALANCE */}
                    <tr className="bg-zinc-100 dark:bg-zinc-900 font-semibold">
                      <td className="border px-2 py-1"></td>
                      <td className="border px-2 py-1">
                        {t("Closing balance")} {MyFormatDate(dateTo)}
                      </td>
                      <td colSpan={9} className="border"></td>
                      <td className="border px-2 py-1 text-right whitespace-nowrap">{formatNumber2(detailOborot.end?.quantity || 0, 2)}</td>
                      <td className="border px-2 py-1 text-right whitespace-nowrap">{formatNumber2(detailOborot.end?.sum || 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </MyModal2>
        </div>
      )}
      {productTurnOverModal.open && detailOborot && (
        <div className="hidden print:block text-[10px] leading-[1.25] text-black">
          <div className="w-full">
            <div className="flex gap-4 items-start">
              <img
                src={`${BASE_URL}${detailOborot?.image}`}
                alt={detailOborot?.product_name}
                className="
            w-20 h-20 object-contain
            rounded-lg
            border
            bg-white
            dark:bg-zinc-800
            border-zinc-200 dark:border-zinc-700
          "
              />

              <div className="flex-1 space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  <Package className="w-4 h-4" />
                  {detailOborot.product_name}
                </div>

                <div className="flex items-center gap-2">
                  <Warehouse className="w-4 h-4 opacity-60" />
                  {selectedWarehouses.length === 1 ? (
                    <span>{detailOborot.warehouse_name}</span>
                  ) : (
                    <div>
                      <span className="font-medium">Выбрано складов: {selectedWarehouses.length}</span>
                      <div className="text-[10px] text-zinc-500 mt-1">
                        {selectedWarehouses.map((id, index) => (
                          <span key={id} className="mr-2">
                            {detailOborot.warehouses && detailOborot.warehouses[id] ? detailOborot.warehouses[id].name : `Склад ${id}`}
                            {index < selectedWarehouses.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  <div>
                    <b>ID:</b> {detailOborot.product_id}
                  </div>
                  <div>
                    <b>{t("unit")}:</b> {detailOborot.product_unit}
                  </div>
                  <div>
                    <b>{t("wholesale_price")}:</b> {formatNumber2(detailOborot.product_wholesale_price)}
                  </div>
                  <div>
                    <b>{t("retail_price")}:</b> {formatNumber2(detailOborot.product_retail_price)}
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-zinc-500">
                  {t("Period")}: {MyFormatDate(dateFrom)} – {MyFormatDate(dateTo)}
                </div>

                {/* Отображение данных по каждому складу, если их несколько */}
                {selectedWarehouses.length > 1 && detailOborot.warehouses && (
                  <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                    <div className="font-medium text-[11px] mb-1">Данные по складам:</div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      {selectedWarehouses.map((whId) => {
                        const whData = detailOborot.warehouses[whId];
                        if (!whData) return null;

                        return (
                          <div key={whId} className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded">
                            <div className="font-medium">{whData.name}</div>
                            <div>Начало: {whData.start_quantity}</div>
                            <div>Приход: {whData.income_qty}</div>
                            <div>Расход: {whData.outcome_qty}</div>
                            <div className="text-blue-600">Возврат: {whData.return_qty}</div>
                            <div>Конец: {whData.end_quantity}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <table className="w-full border border-black border-collapse tabular-nums">
              {/* HEADER */}
              <thead className="table-header-group">
                <tr className="bg-gray-100">
                  <th className="border border-black px-1 py-[2px]">№</th>
                  <th className="border border-black px-1 py-[2px]">{t("Date")}</th>
                  <th className="border border-black px-1 py-[2px]">{t("partner")}</th>
                  <th className="border border-black px-1 py-[2px]">{t("comment2")}</th>
                  <th className="border border-black px-1 py-[2px] text-right">{t("Price")}</th>
                  <th className="border border-black px-1 py-[2px] text-center" colSpan={2}>
                    {t("prihod")}
                  </th>
                  <th className="border border-black px-1 py-[2px] text-center" colSpan={2}>
                    {t("wozwrat")}
                  </th>
                  <th className="border border-black px-1 py-[2px] text-center" colSpan={2}>
                    {t("rashod")}
                  </th>
                  <th className="border border-black px-1 py-[2px] text-center" colSpan={2}>
                    {t("Closing balance")}
                  </th>
                </tr>

                <tr className="bg-gray-50">
                  <th className="border border-black px-1 py-[2px]" />
                  <th className="border border-black px-1 py-[2px]" />
                  <th className="border border-black px-1 py-[2px]" />
                  <th className="border border-black px-1 py-[2px]" />
                  <th className="border border-black px-1 py-[2px]" />
                  <th className="border border-black px-1 py-[2px] text-right">{t("quantity")}</th>
                  <th className="border border-black px-1 py-[2px] text-right">{t("total")}</th>
                  <th className="border border-black px-1 py-[2px] text-right">{t("quantity")}</th>
                  <th className="border border-black px-1 py-[2px] text-right">{t("total")}</th>
                  <th className="border border-black px-1 py-[2px] text-right">{t("quantity")}</th>
                  <th className="border border-black px-1 py-[2px] text-right">{t("total")}</th>
                  <th className="border border-black px-1 py-[2px] text-right">{t("quantity")}</th>
                  <th className="border border-black px-1 py-[2px] text-right">{t("total")}</th>
                </tr>
              </thead>

              <tbody>
                {/* OPENING BALANCE */}
                <tr className="font-semibold">
                  <td className="border border-black px-1 py-[2px]" />
                  <td className="border border-black px-1 py-[2px]">
                    {t("Opening balance")} {MyFormatDate(minusOneDay(dateFrom))}
                  </td>
                  <td colSpan={9} className="border border-black" />
                  <td className="border border-black px-1 py-[2px] text-right">{formatNumber2(detailOborot.start_quantity, 2)}</td>
                  <td className="border border-black px-1 py-[2px] text-right">{formatNumber2(detailOborot.start_quantity * detailOborot.product_wholesale_price)}</td>
                </tr>

                {/* ROWS */}
                {detailOborot.rows?.map((r, i) => (
                  <tr key={i}>
                    <td className="border border-black px-1 py-[2px]">{i + 1}</td>

                    <td className="border border-black px-1 py-[2px]">
                      {MyFormatDate(r.date)} {r.invoice_id && `id: ${r.invoice_id}`}
                    </td>

                    <td className="border border-black px-1 py-[2px]">{r.partner || "-"}</td>

                    <td className="border border-black px-1 py-[2px]">{r.text || "-"}</td>

                    <td className="border border-black px-1 py-[2px] text-right">{formatNumber2(r.price)}</td>

                    <td className="border border-black px-1 py-[2px] text-right">{formatNumber2(r.income_qty, 2)}</td>
                    <td className="border border-black px-1 py-[2px] text-right">{formatNumber2(r.income_sum)}</td>

                    <td className="border border-black px-1 py-[2px] text-right">{formatNumber2(r.return_qty, 2)}</td>
                    <td className="border border-black px-1 py-[2px] text-right">{formatNumber2(r.return_sum)}</td>

                    <td className="border border-black px-1 py-[2px] text-right">{formatNumber2(r.outcome_qty, 2)}</td>
                    <td className="border border-black px-1 py-[2px] text-right">{formatNumber2(r.outcome_sum)}</td>

                    <td className="border border-black px-1 py-[2px] text-right font-medium">{formatNumber2(r.balance_qty, 2)}</td>
                    <td className="border border-black px-1 py-[2px] text-right font-medium">{formatNumber2(r.balance_sum)}</td>
                  </tr>
                ))}

                {/* TURNOVER */}
                <tr className="font-semibold">
                  <td className="border border-black px-1 py-[2px]" />
                  <td className="border border-black px-1 py-[2px]">{t("Total turnover")}</td>
                  <td colSpan={3} className="border border-black" />
                  <td className="border border-black px-1 py-[2px] text-right">{formatNumber2(detailOborot.turnover?.income_qty || 0, 2)}</td>
                  <td className="border border-black px-1 py-[2px] text-right">{formatNumber2(detailOborot.turnover?.income_sum || 0)}</td>
                  <td className="border border-black px-1 py-[2px] text-right">{formatNumber2(detailOborot.turnover?.return_qty || 0, 2)}</td>
                  <td className="border border-black px-1 py-[2px] text-right">{formatNumber2(detailOborot.turnover?.return_sum || 0)}</td>
                  <td className="border border-black px-1 py-[2px] text-right">{formatNumber2(detailOborot.turnover?.outcome_qty || 0, 2)}</td>
                  <td className="border border-black px-1 py-[2px] text-right">{formatNumber2(detailOborot.turnover?.outcome_sum || 0)}</td>
                  <td colSpan={2} className="border border-black" />
                </tr>

                {/* CLOSING BALANCE */}
                <tr className="font-semibold">
                  <td className="border border-black px-1 py-[2px]" />
                  <td className="border border-black px-1 py-[2px]">
                    {t("Closing balance")} {MyFormatDate(dateTo)}
                  </td>
                  <td colSpan={9} className="border border-black" />
                  <td className="border border-black px-1 py-[2px] text-right">{formatNumber2(detailOborot.end?.quantity || 0, 2)}</td>
                  <td className="border border-black px-1 py-[2px] text-right">{formatNumber2(detailOborot.end?.sum || 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
