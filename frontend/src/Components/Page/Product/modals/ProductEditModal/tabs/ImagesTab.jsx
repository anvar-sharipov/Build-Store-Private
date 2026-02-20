import { useFormikContext, Field } from "formik";
import { QRCode } from "react-qrcode-logo";
import UploadImageForm from "../../../../../UI/UploadImageForm";
import { myClass } from "../../../../../tailwindClasses";
import myAxios from "../../../../../axios";

function QRDisplay({ code }) {
  return (
    <div className="flex items-center justify-center w-20 h-20 border rounded">
      <QRCode value={code} size={64} />
    </div>
  );
}

const ImagesTab = ({ options, product, setProduct, t }) => {
  const { values } = useFormikContext();

  const handleDeleteImage = async (imageId) => {
    try {
      await myAxios.delete(`/product-images/${imageId}/`);

      setProduct((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img.id !== imageId),
      }));
    } catch (error) {
      console.error("Ошибка удаления:", error.response?.data || error);
    }
  };

  

  return (
    <div className="space-y-4">
      {/* QR код: инпут + изображение в 1 строку */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">{t("qrCodeLabel")}</label>
          <Field name="qr_code" className={myClass.input2} placeholder={t("qrCodePlaceholder")} autoComplete="off" />
        </div>
        <div className="mt-6">
          <QRDisplay code={values.qr_code} />
        </div>
      </div>

      {/* Изображения продукта */}
      <div className="flex flex-wrap gap-2 mt-3">
        {Array.isArray(product?.images) &&
          product.images.map((img) => {
            console.log("Отображаем изображение:", img); // Добавить отладку
            return (
              // <div key={img.id} className="relative w-16 h-16 group">
              //   {img?.image && (
              //     <img
              //       src={img.image}
              //       alt={img.alt_text || ""}
              //       className="w-full h-full object-cover rounded border border-gray-300"
              //       onError={(e) => {
              //         console.error("Ошибка загрузки изображения:", img.image);
              //         e.target.style.display = "none";
              //       }}
              //       onLoad={() => console.log("Изображение загружено:", img.image)}
              //     />
              //   )}

              // </div>
              <div key={img.id} className="relative w-20 h-20 group">
                {img?.image && <img src={img.image} alt={img.alt_text || ""} className="w-full h-full object-cover rounded border border-gray-300" />}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded">
                  <button type="button" onClick={() => handleDeleteImage(img.id)} className="bg-red-600 hover:bg-red-700 text-white text-sm px-2 py-1 rounded">
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Форма загрузки */}
      <UploadImageForm
        productId={product.id}
        onSuccess={(newImage) =>
          setProduct((prev) => ({
            ...prev,
            images: [...prev.images, newImage],
          }))
        }
      />
    </div>
  );
};

export default ImagesTab;
