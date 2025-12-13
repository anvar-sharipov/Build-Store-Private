import myAxios from "../../axios";
import { useState } from "react";

const FirstPrihod = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    setFile(f);
  };

  const uploadExcel = async () => {
    if (!file) {
      alert("Выберите файл!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await myAxios.post("upload_initial_stock", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log(res.data);
      alert("Загрузка завершена!");
    } catch (err) {
      console.error(err);
      alert("Ошибка загрузки файла");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto" }}>
      <h2 style={{ marginBottom: 20 }}>Первичный приход — загрузка Excel</h2>

      <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} />

      {file && (
        <div style={{ marginTop: 20 }}>
          <b>Файл выбран:</b> {file.name}
        </div>
      )}

      <button
        onClick={uploadExcel}
        disabled={!file || loading}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          cursor: "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Загрузка..." : "Загрузить"}
      </button>
    </div>
  );
};

export default FirstPrihod;