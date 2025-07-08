// lib/migration.js
import { createClient } from "@supabase/supabase-js";
import { read, utils } from "xlsx";
import fs from "fs";

// Configuración de logging (puedes usar console o implementar un logger más sofisticado)
const logger = {
  info: (message) =>
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`),
  error: (message) =>
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`),
  warn: (message) =>
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`),
};

// Constantes de configuración
const BATCH_SIZE = 5000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 segundos en ms

class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this._validateCredentials();
    this.client = this._initializeClient();
  }

  _validateCredentials() {
    if (!this.url || !this.url.startsWith("https://")) {
      throw new Error("URL de Supabase no válida o no configurada");
    }
    if (!this.key || this.key.length < 20) {
      throw new Error("Clave API de Supabase no válida o no configurada");
    }
  }

  _initializeClient() {
    try {
      const client = createClient(this.url, this.key);
      logger.info("✅ Conexión a Supabase establecida correctamente");
      return client;
    } catch (e) {
      logger.error(`❌ Error al conectar con Supabase: ${e.message}`);
      throw e;
    }
  }
}

class DataProcessor {
  constructor(supabaseClient) {
    this.supabase = supabaseClient.client;
  }

  async processInBatches(data, processingFunc, operationName) {
    const totalRecords = data.length;
    const batches = [];

    for (let i = 0; i < totalRecords; i += BATCH_SIZE) {
      batches.push(data.slice(i, i + BATCH_SIZE));
    }

    logger.info(`Procesando ${operationName} en ${batches.length} lotes...`);

    for (const batch of batches) {
      let attempts = 0;
      let success = false;

      while (!success && attempts < MAX_RETRIES) {
        try {
          await processingFunc(batch);
          success = true;
          logger.info(
            `Procesado lote de ${batch.length} registros para ${operationName}`
          );
        } catch (e) {
          attempts += 1;
          if (attempts >= MAX_RETRIES) {
            logger.error(`Error persistente al procesar lote: ${e.message}`);
            await this._saveFailedBatch(batch, operationName);
          } else {
            await new Promise((resolve) =>
              setTimeout(resolve, RETRY_DELAY * attempts)
            );
          }
        }
      }
    }
  }

  async _saveFailedBatch(batch, operationName) {
    const timestamp = Date.now();
    const filename = `error_batch_${operationName}_${timestamp}.json`;

    try {
      await fs.promises.writeFile(filename, JSON.stringify(batch, null, 2));
      logger.info(`Lote fallido guardado en ${filename}`);
    } catch (e) {
      logger.error(`Error al guardar lote fallido: ${e.message}`);
    }
  }
}

class ClientProcessor extends DataProcessor {
  async processClients(salesDf, returnsDf) {
    logger.info("🔍 Extrayendo datos de clientes...");

    // Extraer datos únicos de clientes
    const combinedClients = this._getUniqueClients(salesDf, returnsDf);
    logger.info(
      `📊 Total de clientes únicos encontrados: ${combinedClients.length.toLocaleString()}`
    );

    // Procesar jerarquía de clientes
    await this._processClientHierarchy(combinedClients);
  }

  _getUniqueClients(salesDf, returnsDf) {
    // Combina y devuelve clientes únicos de ventas y devoluciones
    const salesClients = salesDf.map((row) => ({
      "COD CLIENTE": row["COD CLIENTE"],
      CLIENTE: row["CLIENTE"],
      UBICACION: row["UBICACION"],
      ESTADO: row["ESTADO"],
    }));

    const returnsClients = returnsDf.map((row) => ({
      "COD CLIENTE": row["COD CLIENTE"],
      CLIENTE: row["CLIENTE"],
      UBICACION: row["UBICACION"],
      ESTADO: row["ESTADO"],
    }));

    // Eliminar duplicados
    const allClients = [...salesClients, ...returnsClients];
    const uniqueClients = allClients.filter(
      (client, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t["COD CLIENTE"] === client["COD CLIENTE"] &&
            t["CLIENTE"] === client["CLIENTE"] &&
            t["UBICACION"] === client["UBICACION"] &&
            t["ESTADO"] === client["ESTADO"]
        )
    );

    return uniqueClients;
  }

  async _processClientHierarchy(clientsDf) {
    // Procesar estados
    const uniqueStates = [
      ...new Set(clientsDf.map((client) => client["ESTADO"])),
    ];
    logger.info(`🏙 Procesando ${uniqueStates.length} estados...`);
    await this.processInBatches(
      uniqueStates,
      this._processStatesBatch.bind(this),
      "estados"
    );

    // Procesar ubicaciones
    const uniqueLocations = clientsDf
      .map((client) => ({
        UBICACION: client["UBICACION"],
        ESTADO: client["ESTADO"],
      }))
      .filter(
        (location, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              t["UBICACION"] === location["UBICACION"] &&
              t["ESTADO"] === location["ESTADO"]
          )
      );
    logger.info(`📍 Procesando ${uniqueLocations.length} ubicaciones...`);
    await this.processInBatches(
      uniqueLocations,
      this._processLocationsBatch.bind(this),
      "ubicaciones"
    );

    // Procesar clientes maestros
    const uniqueMasterClients = [
      ...new Set(clientsDf.map((client) => client["CLIENTE"])),
    ];
    logger.info(
      `🏢 Procesando ${uniqueMasterClients.length} clientes maestros...`
    );
    await this.processInBatches(
      uniqueMasterClients,
      this._processMasterClientsBatch.bind(this),
      "clientes_maestros"
    );

    // Procesar clientes sucursales
    logger.info(
      `🏪 Procesando ${clientsDf.length.toLocaleString()} clientes sucursales...`
    );
    await this.processInBatches(
      clientsDf,
      this._processBranchClientsBatch.bind(this),
      "clientes_sucursales"
    );

    logger.info("✅ Procesamiento de clientes completado exitosamente!");
  }

  async _processStatesBatch(batch) {
    const { data: existingStates, error } = await this.supabase
      .from("estados")
      .select("nombre_estado");

    if (error) throw error;

    const existingNames = new Set(
      existingStates.map((state) => state.nombre_estado)
    );
    const newStates = batch
      .filter((state) => !existingNames.has(state))
      .map((state) => ({ nombre_estado: state }));

    if (newStates.length > 0) {
      const { error: insertError } = await this.supabase
        .from("estados")
        .insert(newStates);

      if (insertError) throw insertError;
    }
  }

  async _processLocationsBatch(batch) {
    // Obtener mapeo de estados
    const { data: states, error: statesError } = await this.supabase
      .from("estados")
      .select("id_estado, nombre_estado");

    if (statesError) throw statesError;

    const stateMap = new Map(
      states.map((state) => [state.nombre_estado, state.id_estado])
    );

    // Verificar ubicaciones existentes
    const { data: existingLocations, error: locationsError } =
      await this.supabase.from("ubicaciones").select("nombre_ubicacion");

    if (locationsError) throw locationsError;

    const existingNames = new Set(
      existingLocations.map((loc) => loc.nombre_ubicacion)
    );
    const newLocations = [];

    for (const row of batch) {
      if (!existingNames.has(row["UBICACION"])) {
        const stateId = stateMap.get(row["ESTADO"]);
        if (stateId) {
          newLocations.push({
            nombre_ubicacion: row["UBICACION"],
            id_estado: stateId,
          });
        }
      }
    }

    if (newLocations.length > 0) {
      const { error: insertError } = await this.supabase
        .from("ubicaciones")
        .insert(newLocations);

      if (insertError) throw insertError;
    }
  }

  async _processMasterClientsBatch(batch) {
    const { data: existingClients, error } = await this.supabase
      .from("clientes_maestros")
      .select("nombre_cliente");

    if (error) throw error;

    const existingNames = new Set(
      existingClients.map((client) => client.nombre_cliente)
    );
    const newClients = batch
      .filter((client) => !existingNames.has(client))
      .map((client) => ({ nombre_cliente: client }));

    if (newClients.length > 0) {
      const { error: insertError } = await this.supabase
        .from("clientes_maestros")
        .insert(newClients);

      if (insertError) throw insertError;
    }
  }

  async _processBranchClientsBatch(batch) {
    // Pre-cachear datos necesarios
    const { data: masterClients, error: masterError } = await this.supabase
      .from("clientes_maestros")
      .select("id_cliente_maestro, nombre_cliente");

    if (masterError) throw masterError;

    const masterMap = new Map(
      masterClients.map((client) => [
        client.nombre_cliente,
        client.id_cliente_maestro,
      ])
    );

    const { data: locations, error: locationsError } = await this.supabase
      .from("ubicaciones")
      .select("id_ubicacion, nombre_ubicacion");

    if (locationsError) throw locationsError;

    const locationMap = new Map(
      locations.map((loc) => [loc.nombre_ubicacion, loc.id_ubicacion])
    );

    // Verificar clientes existentes
    const { data: existingBranches, error: branchesError } = await this.supabase
      .from("clientes_sucursales")
      .select("cod_cliente");

    if (branchesError) throw branchesError;

    const existingCodes = new Set(
      existingBranches.map((branch) => String(branch.cod_cliente))
    );
    const newBranches = [];

    for (const row of batch) {
      const clientCode = String(row["COD CLIENTE"]);
      if (!existingCodes.has(clientCode)) {
        const masterId = masterMap.get(row["CLIENTE"]);
        const locationId = locationMap.get(row["UBICACION"]);

        if (masterId && locationId) {
          newBranches.push({
            cod_cliente: clientCode,
            id_cliente_maestro: masterId,
            id_ubicacion: locationId,
          });
        }
      }
    }

    if (newBranches.length > 0) {
      const { error: insertError } = await this.supabase
        .from("clientes_sucursales")
        .insert(newBranches);

      if (insertError) throw insertError;
    }
  }
}

class ProductProcessor extends DataProcessor {
  async processProducts(salesDf, returnsDf) {
    logger.info("🔍 Extrayendo datos de productos...");

    // Extraer datos únicos de productos
    const combinedProducts = this._getUniqueProducts(salesDf, returnsDf);
    logger.info(
      `📦 Total de productos únicos encontrados: ${combinedProducts.length.toLocaleString()}`
    );

    // Procesar productos
    logger.info("📦 Procesando productos...");
    await this.processInBatches(
      combinedProducts,
      this._processProductsBatch.bind(this),
      "productos"
    );

    logger.info("✅ Procesamiento de productos completado exitosamente!");
  }

  _getUniqueProducts(salesDf, returnsDf) {
    const salesProducts = salesDf.map((row) => ({
      "COD ARTICULO": row["COD ARTICULO"],
      ARTICULO: row["ARTICULO"],
    }));

    const returnsProducts = returnsDf.map((row) => ({
      "COD ARTICULO": row["COD ARTICULO"],
      ARTICULO: row["ARTICULO"],
    }));

    // Eliminar duplicados
    const allProducts = [...salesProducts, ...returnsProducts];
    const uniqueProducts = allProducts.filter(
      (product, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t["COD ARTICULO"] === product["COD ARTICULO"] &&
            t["ARTICULO"] === product["ARTICULO"]
        )
    );

    return uniqueProducts;
  }

  async _processProductsBatch(batch) {
    const productCodes = batch.map((row) => row["COD ARTICULO"]);

    const { data: existingProducts, error } = await this.supabase
      .from("articulos")
      .select("cod_articulo")
      .in("cod_articulo", productCodes);

    if (error) throw error;

    const existingCodes = new Set(
      existingProducts.map((product) => product.cod_articulo)
    );
    const newProducts = [];

    for (const row of batch) {
      if (!existingCodes.has(String(row["COD ARTICULO"]))) {
        newProducts.push({
          cod_articulo: String(row["COD ARTICULO"]),
          nombre_articulo: row["ARTICULO"],
        });
      }
    }

    if (newProducts.length > 0) {
      const { error: insertError } = await this.supabase
        .from("articulos")
        .insert(newProducts);

      if (insertError) throw insertError;
    }
  }
}

class TransactionProcessor extends DataProcessor {
  constructor(supabaseClient) {
    super(supabaseClient);
    this.clientCache = new Map();
    this.productCache = new Map();
  }

  async processShipments(shipmentsDf) {
    logger.info("🔍 Extrayendo datos de despachos...");

    // Validar y limpiar datos
    const cleanedDf = await this._validateAndCleanData(
      shipmentsDf,
      ["FECHA", "COD CLIENTE", "COD ARTICULO", "VENTA UNDS"],
      "despachos"
    );

    // Precargar cachés
    await this._preloadCaches();

    // Procesar despachos
    logger.info("🚚 Procesando despachos...");
    await this.processInBatches(
      cleanedDf,
      this._processShipmentsBatch.bind(this),
      "despachos"
    );

    logger.info("✅ Procesamiento de despachos completado exitosamente!");
  }

  async processReturns(returnsDf) {
    logger.info("🔍 Extrayendo datos de devoluciones...");

    // Validar y limpiar datos
    const cleanedDf = await this._validateAndCleanData(
      returnsDf,
      ["FECHA", "COD CLIENTE", "COD ARTICULO", "DEVO UNDS"],
      "devoluciones"
    );

    // Precargar cachés
    await this._preloadCaches();

    // Procesar devoluciones
    logger.info("🔄 Procesando devoluciones...");
    await this.processInBatches(
      cleanedDf,
      this._processReturnsBatch.bind(this),
      "devoluciones"
    );

    logger.info("✅ Procesamiento de devoluciones completado exitosamente!");
  }

  async _validateAndCleanData(df, requiredColumns, operationName) {
    // Verificar columnas requeridas (esto está bien)
    const missingColumns = requiredColumns.filter(
      (col) => !df.some((row) => col in row)
    );

    if (missingColumns.length > 0) {
      throw new Error(
        `El DataFrame de ${operationName} no tiene las columnas requeridas: ${missingColumns.join(
          ", "
        )}`
      );
    }

    // Filtrar fechas válidas (modificado)
    const validRows = [];
    const invalidRows = [];

    for (const [index, row] of df.entries()) {
      const dateStr = row["FECHA"];
      let date;

      try {
        if (typeof dateStr === "number") {
          // Serial de Excel
          date = new Date(Math.round((dateStr - 25568) * 86400 * 1000));
        } else if (typeof dateStr === "string") {
          // Asume formato DD/MM/YYYY o intenta parsear de otras formas
          const parts = dateStr.split("/");
          if (parts.length === 3) {
            const [day, month, year] = parts.map(Number);
            date = new Date(year, month - 1, day);
          } else {
            date = new Date(dateStr); // fallback
          }
        } else if (dateStr instanceof Date) {
          date = dateStr;
        } else {
          date = new Date(dateStr);
        }

        if (isNaN(date.getTime())) {
          invalidRows.push({
            ...row,
            _rowNumber: index + 1,
            _error: "Fecha inválida",
          });
        } else {
          validRows.push({
            ...row,
            FECHA: date,
            _rowNumber: index + 1,
          });
        }
      } catch (e) {
        invalidRows.push({ ...row, _rowNumber: index + 1, _error: e.message });
      }
    }

    if (invalidRows.length > 0) {
      logger.warn(
        `⚠ Advertencia: ${invalidRows.length.toLocaleString()} filas inválidas en ${operationName}. Ejemplos: ${JSON.stringify(
          invalidRows.slice(0, 5)
        )}`
      );
      await this._saveFailedBatch(invalidRows, `invalid_rows_${operationName}`);
    }

    logger.info(
      `📦 Total de registros válidos en ${operationName}: ${validRows.length.toLocaleString()} de ${df.length.toLocaleString()}`
    );
    return validRows;
  }

  async _preloadCaches() {
    if (this.clientCache.size === 0 || this.productCache.size === 0) {
      logger.info("⚡ Precargando cachés de clientes y productos...");

      // Cargar clientes - asegurando manejar tanto números como strings
      const { data: clients, error: clientsError } = await this.supabase
        .from("clientes_sucursales")
        .select("cod_cliente, id_cliente_sucursal");

      if (clientsError) throw clientsError;

      this.clientCache = new Map();
      clients.forEach((client) => {
        // Asegurar que la clave sea string para comparación consistente
        this.clientCache.set(
          String(client.cod_cliente),
          client.id_cliente_sucursal
        );
      });

      // Cargar productos - asegurando manejar tanto números como strings
      const { data: products, error: productsError } = await this.supabase
        .from("articulos")
        .select("cod_articulo, id_articulo");

      if (productsError) throw productsError;

      this.productCache = new Map();
      products.forEach((product) => {
        // Asegurar que la clave sea string para comparación consistente
        this.productCache.set(
          String(product.cod_articulo),
          product.id_articulo
        );
      });

      logger.info(
        `⚡ Caché precargado: ${this.clientCache.size} clientes, ${this.productCache.size} productos`
      );
    }
  }

  async _processShipmentsBatch(batch) {
    const recordsToInsert = [];

    for (const row of batch) {
      const clientCode = String(row["COD CLIENTE"]);
      const productCode = String(row["COD ARTICULO"]);

      // Verificar existencia en caché
      if (!this.clientCache.has(clientCode)) {
        logger.warn(
          `Cliente no encontrado en caché: ${clientCode} (Fila: ${JSON.stringify(
            row
          )})`
        );
        continue;
      }
      if (!this.productCache.has(productCode)) {
        logger.warn(
          `Producto no encontrado en caché: ${productCode} (Fila: ${JSON.stringify(
            row
          )})`
        );
        continue;
      }

      recordsToInsert.push({
        fecha_despacho: this._formatDate(row["FECHA"]),
        id_cliente_sucursal: this.clientCache.get(clientCode),
        id_articulo: this.productCache.get(productCode),
        unidades_despachadas: row["VENTA UNDS"],
      });
    }

    // Insertar lote completo
    if (recordsToInsert.length > 0) {
      const { error } = await this.supabase
        .from("despachos")
        .insert(recordsToInsert);

      if (error) throw error;
    }
  }

  async _processReturnsBatch(batch) {
    const recordsToInsert = [];
    const skippedRecords = [];

    for (const row of batch) {
      const clientCode = String(row["COD CLIENTE"]);
      const productCode = String(row["COD ARTICULO"]);

      // Verificar existencia en caché
      if (!this.clientCache.has(clientCode)) {
        skippedRecords.push({
          ...row,
          _rowNumber: row._rowNumber,
          _error: `Cliente no encontrado: ${clientCode}`,
        });
        continue;
      }
      if (!this.productCache.has(productCode)) {
        skippedRecords.push({
          ...row,
          _rowNumber: row._rowNumber,
          _error: `Producto no encontrado: ${productCode}`,
        });
        continue;
      }

      recordsToInsert.push({
        fecha: this._formatDate(row["FECHA"]),
        id_cliente_sucursal: this.clientCache.get(clientCode),
        id_articulo: this.productCache.get(productCode),
        unidades_devueltas: row["DEVO UNDS"],
      });
    }

    // Registrar registros omitidos
    if (skippedRecords.length > 0) {
      logger.warn(
        `Se omitieron ${skippedRecords.length
        } registros en el lote. Ejemplos: ${JSON.stringify(
          skippedRecords.slice(0, 3)
        )}`
      );
      await this._saveFailedBatch(skippedRecords, `skipped_returns_batch`);
    }

    // Insertar lote completo
    if (recordsToInsert.length > 0) {
      const { error } = await this.supabase
        .from("devoluciones")
        .insert(recordsToInsert);

      if (error) throw error;
    }
  }
  _formatDate(date) {
    // Formatea la fecha como YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

class DataMigration {
  constructor(supabaseUrl, supabaseKey) {
    this.supabase = new SupabaseClient(supabaseUrl, supabaseKey);
    this.clientProcessor = new ClientProcessor(this.supabase);
    this.productProcessor = new ProductProcessor(this.supabase);
    this.transactionProcessor = new TransactionProcessor(this.supabase);
  }

  async loadData(file) {
    logger.info("📂 Leyendo archivo Excel...");

    try {
      // Leer el archivo Excel
      const data = await file.arrayBuffer();
      const workbook = read(data);

      // Obtener las hojas necesarias
      const salesSheet = workbook.Sheets["DATA VENTAS"];
      const returnsSheet = workbook.Sheets["DATA DEVO"];

      if (!salesSheet || !returnsSheet) {
        throw new Error(
          "El archivo Excel no contiene las hojas requeridas (DATA VENTAS y DATA DEVO)"
        );
      }

      // Convertir a JSON
      const salesDf = utils.sheet_to_json(salesSheet);
      const returnsDf = utils.sheet_to_json(returnsSheet);

      logger.info("✅ Archivo Excel cargado correctamente");
      return { salesDf, returnsDf };
    } catch (e) {
      logger.error(`Error al cargar el archivo Excel: ${e.message}`);
      throw e;
    }
  }

  async migrate(file) {
    const startTime = Date.now();
    logger.info("🚀 Iniciando migración de datos a Supabase");

    try {
      // Cargar datos
      const { salesDf, returnsDf } = await this.loadData(file);

      // Procesar clientes y productos en paralelo
      await Promise.all([
        this.clientProcessor.processClients(salesDf, returnsDf),
        this.productProcessor.processProducts(salesDf, returnsDf),
      ]);

      // Procesar despachos y devoluciones en paralelo
      await Promise.all([
        this.transactionProcessor.processShipments(salesDf),
        this.transactionProcessor.processReturns(returnsDf),
      ]);

      const duration = (Date.now() - startTime) / 1000;
      logger.info(`🏁 Proceso completado en ${duration.toFixed(2)} segundos`);
    } catch (e) {
      logger.error(`❌ Error inesperado durante la migración: ${e.message}`);
      throw e;
    }
  }
}

export { DataMigration };