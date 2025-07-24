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

  return (
    <div className="space-y-4">
      {/* QR код: инпут + изображение в 1 строку */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">
            {t("qrCodeLabel")}
          </label>
          <Field
            name="qr_code"
            className={myClass.input2}
            placeholder={t("qrCodePlaceholder")}
            autoComplete="off"
            disabled
          />
        </div>
        <div className="mt-6">
          <QRDisplay code={values.qr_code} />
        </div>
      </div>

      {/* Изображения продукта */}
      <div className="flex flex-wrap gap-2 mt-3">
        {Array.isArray(product?.images) &&
          product.images.map((img) => (
            <div key={img.id} className="relative w-16 h-16 group">
              <img
                src={img.image}
                alt={img.alt_text || ""}
                className="w-full h-full object-cover rounded border border-gray-300"
              />
              <button
                type="button"
                onClick={async () => {
                  try {
                    await myAxios.delete(`/product-images/${img.id}/`);
                    setProduct((prev) => ({
                      ...prev,
                      images: prev.images.filter((i) => i.id !== img.id),
                    }));
                  } catch (err) {
                    console.error("Ошибка при удалении изображения", err);
                  }
                }}
                className="absolute top-0 right-0 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition"
                title="Удалить"
              >
                ×
              </button>
            </div>
          ))}
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
