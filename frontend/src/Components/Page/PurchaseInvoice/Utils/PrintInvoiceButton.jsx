import React, { useRef } from "react";
import { FaReceipt } from "react-icons/fa";
import { formatNumber } from "../../../UI/formatNumber";

const PrintInvoiceButton = ({ invoiceData }) => {
  const printRef = useRef();

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Чек</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 14px;
              margin: 20px;
              color: #000;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header svg {
              width: 40px;
              height: 40px;
            }
            h2 {
              margin: 5px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border-bottom: 1px dashed #000;
              padding: 4px 0;
              text-align: left;
            }
            th {
              font-weight: bold;
            }
            .total {
              margin-top: 10px;
              text-align: right;
              font-weight: bold;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 12px;
            }
            @media print {
              body { color: #000; }
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const calculateTotal = () => {
    return invoiceData.products.reduce((sum, p) => sum + (p.selected_price || 0) * (p.selected_quantity || 1), 0);
  };

  return (
    <div>
      <button type="button" onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
        Печать чека
      </button>

      <div ref={printRef} style={{ display: "none" }}>
        <div className="header">
          <FaReceipt />
          <h2>Чек магазина</h2>
          <p>{invoiceData.invoice_date}</p>
        </div>

        <p>
          <strong>Клиент:</strong> {invoiceData.partner?.name}
        </p>
        <p>
          <strong>Склад:</strong> {invoiceData.warehouse?.name}
        </p>

        <table>
          <thead>
            <tr>
              <th>Товар</th>
              <th>Кол-во</th>
              <th>Цена</th>
              <th>Сумма</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.products.map((p) => {
                console.log("p", p);

                let conversion_factor = 1
                let unit = p.base_unit_obj.name
                if (p.units && p.units.length > 0) {
                    const selected_unit = p.units.find((u) => u.is_default_for_sale === true);
                    if (selected_unit) {
                        conversion_factor = selected_unit.conversion_factor
                        unit = selected_unit.unit_name
                    }
                }


                
              return (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>
                    {p.selected_quantity || 1} {unit}
                  </td>
                  <td>{formatNumber(p.selected_price) || 0}</td>
                  <td>{formatNumber((p.selected_price || 0) * (p.selected_quantity || 1))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p className="total">Итого: {calculateTotal()}</p>

        {invoiceData.comment && (
          <p>
            <strong>Комментарий:</strong> {invoiceData.comment}
          </p>
        )}

        <div className="footer">
          <p>Спасибо за покупку!</p>
        </div>
      </div>
    </div>
  );
};

export default PrintInvoiceButton;
