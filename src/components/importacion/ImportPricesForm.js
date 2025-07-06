// components/importacion/ImportPricesForm.js
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ImportPricesForm() {
  // Estados para la importación por Excel
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Estados para la actualización manual
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [newPrice, setNewPrice] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Cargar productos al montar el componente
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("articulos")
          .select(
            `
                        id_articulo,
                        cod_articulo,
                        nombre_articulo,
                        precios_articulos (precio)
                    `
          )
          .order("nombre_articulo", { ascending: true });

        if (error) throw error;

        // Mapear los productos con sus precios actuales
        const productsWithPrices = data.map((product) => ({
          ...product,
          currentPrice: product.precios_articulos[0]?.precio || 0,
        }));

        setProducts(productsWithPrices);
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setError("Error al cargar la lista de productos");
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Manejar selección de producto
  const handleProductSelect = (productId) => {
    const product = products.find((p) => p.id_articulo === productId);
    if (product) {
      setSelectedProduct(product);
      setCurrentPrice(product.currentPrice);
      setNewPrice(product.currentPrice.toString());
    }
  };

  // Manejar actualización de precio manual
  const handleManualUpdate = async (e) => {
    e.preventDefault();

    if (!selectedProduct || !newPrice) {
      setError("Por favor selecciona un producto y especifica un nuevo precio");
      return;
    }

    const priceValue = parseFloat(newPrice);
    if (isNaN(priceValue)) {
      setError("Por favor ingresa un valor numérico válido");
      return;
    }

    setIsUpdating(true);
    setError("");
    setMessage("");

    try {
      // Verificar si ya existe un precio para este artículo
      const { data: existingPrice, error: fetchError } = await supabase
        .from("precios_articulos")
        .select("id_precio")
        .eq("id_articulo", selectedProduct.id_articulo)
        .single();

      let upsertError;

      if (existingPrice) {
        // Actualizar precio existente
        const { error } = await supabase
          .from("precios_articulos")
          .update({ precio: priceValue })
          .eq("id_articulo", selectedProduct.id_articulo);

        upsertError = error;
      } else {
        // Insertar nuevo precio
        const { error } = await supabase.from("precios_articulos").insert([
          {
            id_articulo: selectedProduct.id_articulo,
            precio: priceValue,
          },
        ]);

        upsertError = error;
      }

      if (upsertError) throw upsertError;

      // Actualizar el estado local
      const updatedProducts = products.map((p) =>
        p.id_articulo === selectedProduct.id_articulo
          ? { ...p, currentPrice: priceValue }
          : p
      );

      setProducts(updatedProducts);
      setCurrentPrice(priceValue);
      setMessage(
        `Precio actualizado correctamente para ${selectedProduct.nombre_articulo}`
      );
    } catch (err) {
      console.error("Error al actualizar precio:", err);
      setError(err.message || "Error al actualizar el precio");
    } finally {
      setIsUpdating(false);
    }
  };

  // Manejar importación por Excel (existente)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Por favor selecciona un archivo");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      // Subir el archivo a Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `price-updates/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("price-updates")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Llamar a la función de backend para procesar
      const { data, error: processError } = await supabase.functions.invoke(
        "process-prices",
        {
          body: { filePath },
        }
      );

      if (processError) throw processError;

      setMessage(
        `Actualización completada: ${data.productsUpdated} productos actualizados`
      );

      // Recargar productos después de la actualización masiva
      const { data: updatedProducts } = await supabase
        .from("articulos")
        .select(
          `
                    id_articulo,
                    cod_articulo,
                    nombre_articulo,
                    precios_articulos (precio)
                `
        )
        .order("nombre_articulo", { ascending: true });

      setProducts(
        updatedProducts.map((p) => ({
          ...p,
          currentPrice: p.precios_articulos[0]?.precio || 0,
        }))
      );
    } catch (err) {
      console.error("Error al actualizar precios:", err);
      setError(err.message || "Error al procesar el archivo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="prices-update-container">
      <div className="update-section">
        <h3>Actualizar Precio Individual</h3>
        <form onSubmit={handleManualUpdate} className="manual-update-form">
          <div className="form-group">
            <label htmlFor="product-select">Seleccionar Producto:</label>
            <select
              id="product-select"
              value={selectedProduct?.id_articulo || ""}
              onChange={(e) => handleProductSelect(parseInt(e.target.value))}
              disabled={isLoadingProducts}
            >
              <option value="">-- Selecciona un producto --</option>
              {products.map((product) => (
                <option key={product.id_articulo} value={product.id_articulo}>
                  {product.cod_articulo} - {product.nombre_articulo}
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <>
              <div className="form-group">
                <label>Precio Actual:</label>
                <input
                  type="text"
                  value={currentPrice}
                  readOnly
                  className="read-only-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="new-price">Nuevo Precio:</label>
                <input
                  id="new-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  disabled={isUpdating}
                />
              </div>
              <button
                type="submit"
                disabled={isUpdating}
                className="submit-button"
              >
                {isUpdating ? "Actualizando..." : "Actualizar Precio"}
              </button>
            </>
          )}
        </form>
      </div>



      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <style jsx>{`
        .prices-update-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .update-section {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .divider {
          text-align: center;
          position: relative;
          margin: 1rem 0;
        }
        .divider::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #ddd;
          z-index: -1;
        }
        .divider span {
          background: white;
          padding: 0 1rem;
          position: relative;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        select,
        input[type="text"],
        input[type="number"],
        input[type="file"] {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .read-only-input {
          background: #eee;
          cursor: not-allowed;
        }
        .submit-button {
          background: #4f46e5;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .submit-button:hover {
          background: #4338ca;
        }
        .submit-button:disabled {
          background: #a5b4fc;
          cursor: not-allowed;
        }
        .success-message {
          color: #065f46;
          background: #d1fae5;
          padding: 0.75rem;
          border-radius: 4px;
          margin-top: 1rem;
        }
        .error-message {
          color: #b91c1c;
          background: #fee2e2;
          padding: 0.75rem;
          border-radius: 4px;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
}
