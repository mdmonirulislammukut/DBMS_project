import express from "express";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Database connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "MKT", // Update with your MySQL password
  database: "nonmeat_agriproduct_database", // Your database name
};

// Create database connection pool
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT 1 as test");
    res.json({ 
      status: "healthy", 
      database: "connected", 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      status: "error",
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ============= DASHBOARD DATA ENDPOINTS =============

// Get dashboard summary data
app.get("/api/dashboard-summary", async (req, res) => {
  try {
    // Total inventory (sum of all crop quantities in harvest table)
    const [inventoryRows] = await pool.execute(
      "SELECT SUM(Crop_Quantity) as totalInventory FROM harvest"
    );
    
    // Total products (count of distinct crop types)
    const [productRows] = await pool.execute(
      "SELECT COUNT(DISTINCT Seed_Type) as totalProducts FROM crop"
    );
    
    // Total capacity (sum of all warehouse maximum capacities)
    const [capacityRows] = await pool.execute(
      "SELECT SUM(Maximum_capacity) as totalCapacity FROM warehouse"
    );
    
    // Total farmers (count of all farmers)
    const [farmerRows] = await pool.execute(
      "SELECT COUNT(*) as totalFarmers FROM farm"
    );
    
    res.json({
      totalInventory: inventoryRows[0].totalInventory || 0,
      totalProducts: productRows[0].totalProducts || 0,
      totalCapacity: capacityRows[0].totalCapacity || 0,
      totalFarmers: farmerRows[0].totalFarmers || 0
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
});

// Get most stored crops data for pie chart
app.get("/api/most-stored-crops", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT c.Seed_Type as crop, SUM(h.Crop_Quantity) as quantity
      FROM harvest h
      JOIN crop c ON h.CropID = c.CropID
      GROUP BY c.Seed_Type
      ORDER BY quantity DESC
      LIMIT 5
    `);
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching most stored crops:", error);
    res.status(500).json({ error: "Failed to fetch most stored crops" });
  }
});

// Get storage utilization by warehouse for bar chart
app.get("/api/storage-utilization", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        w.Warehouse_name as warehouse,
        ROUND((w.Occupide_storage / w.Maximum_capacity) * 100, 2) as utilization
      FROM warehouse w
      ORDER BY utilization DESC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching storage utilization:", error);
    res.status(500).json({ error: "Failed to fetch storage utilization" });
  }
});

// ============= AGRICULTURAL PRODUCTS ENDPOINTS =============

// Get agricultural products with complex join
// [file name]: server.js (corrected excerpts)

// ... (keep the beginning of the file the same until the agricultural products endpoint)

// Get agricultural products with complex join - FIXED
app.get("/api/agricultural-products", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        c.Seed_Type,
        c.CropID,
        h.HarvestBatchID as BatchID,
        c.Sowing_date,
        c.Expected_Harvest_Date,
        h.Requirement_Temperature,
        h.Shelf_Life,
        p.Process_date as Packaging_Date,
        p.Package_type as Packing_Type
      FROM crop c
      LEFT JOIN harvest h ON c.CropID = h.CropID
      LEFT JOIN package_batch p ON h.HarvestBatchID = p.HarvestBatchID
      ORDER BY c.CropID
    `);
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching agricultural products:", error);
    res.status(500).json({ error: "Failed to fetch agricultural products" });
  }
});

// Add new agricultural product - FIXED
app.post("/api/agricultural-products", async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { 
      Seed_Type, 
      Sowing_date, 
      Expected_Harvest_Date, 
      Requirement_Temperature, 
      Shelf_Life, 
      Process_date, 
      Package_type,
      FarmerID,
      WarehouseID,
      Crop_Quantity
    } = req.body;
    
    // 1. Insert into crop table
    const [cropResult] = await connection.execute(
      "INSERT INTO crop (Seed_Type, Sowing_date, Expected_Harvest_Date) VALUES (?, ?, ?)",
      [Seed_Type, Sowing_date, Expected_Harvest_Date]
    );
    
    const cropId = cropResult.insertId;
    
    // 2. Link crop to farmer
    await connection.execute(
      "INSERT INTO `crop farm` (CropID, FarmerID) VALUES (?, ?)",
      [cropId, FarmerID]
    );
    
    // 3. Insert into harvest table
    const [harvestResult] = await connection.execute(
      "INSERT INTO harvest (Harvest_Date, Requirement_Temperature, Shelf_Life, Season, Crop_Quantity, FarmerID, WarehouseID, CropID) VALUES (CURDATE(), ?, ?, 'Unknown', ?, ?, ?, ?)",
      [Requirement_Temperature, Shelf_Life, Crop_Quantity, FarmerID, WarehouseID, cropId]
    );
    
    const harvestBatchId = harvestResult.insertId;
    
    // 4. Insert into package_batch table
    await connection.execute(
      "INSERT INTO package_batch (Product_name, Expire_date, Process_date, Package_type, HarvestBatchID) VALUES (?, DATE_ADD(?, INTERVAL ? DAY), ?, ?, ?)",
      [Seed_Type, Process_date, Shelf_Life, Process_date, Package_type, harvestBatchId]
    );
    
    await connection.commit();
    
    res.json({ 
      id: cropId, 
      message: "Agricultural product added successfully" 
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error adding agricultural product:", error);
    res.status(500).json({ error: "Failed to add agricultural product" });
  } finally {
    connection.release();
  }
});

// ... (keep the rest of the server.js file as is)
// Update agricultural product
app.put("/api/agricultural-products/:id", async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { 
      Seed_Type, 
      Sowing_date, 
      Expected_Harvest_Date, 
      Requirement_Temperature, 
      Shelf_Life, 
      Process_date, 
      Package_type 
    } = req.body;
    
    // 1. Update crop table
    await connection.execute(
      "UPDATE crop SET Seed_Type = ?, Sowing_date = ?, Expected_Harvest_Date = ? WHERE CropID = ?",
      [Seed_Type, Sowing_date, Expected_Harvest_Date, id]
    );
    
    // 2. Get harvest batch ID
    const [harvestRows] = await connection.execute(
      "SELECT HarvestBatchID FROM harvest WHERE CropID = ?",
      [id]
    );
    
    if (harvestRows.length > 0) {
      const harvestBatchId = harvestRows[0].HarvestBatchID;
      
      // 3. Update harvest table
      await connection.execute(
        "UPDATE harvest SET Requirement_Temperature = ?, Shelf_Life = ? WHERE HarvestBatchID = ?",
        [Requirement_Temperature, Shelf_Life, harvestBatchId]
      );
      
      // 4. Update package_batch table
      await connection.execute(
        "UPDATE package_batch SET Product_name = ?, Expire_date = DATE_ADD(?, INTERVAL ? DAY), Process_date = ?, Package_type = ? WHERE HarvestBatchID = ?",
        [Seed_Type, Process_date, Shelf_Life, Process_date, Package_type, harvestBatchId]
      );
    }
    
    await connection.commit();
    
    res.json({ message: "Agricultural product updated successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating agricultural product:", error);
    res.status(500).json({ error: "Failed to update agricultural product" });
  } finally {
    connection.release();
  }
});

// Delete agricultural product
app.delete("/api/agricultural-products/:id", async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    
    // Get harvest batch ID first
    const [harvestRows] = await connection.execute(
      "SELECT HarvestBatchID FROM harvest WHERE CropID = ?",
      [id]
    );
    
    if (harvestRows.length > 0) {
      const harvestBatchId = harvestRows[0].HarvestBatchID;
      
      // Delete from package_batch first (child table)
      await connection.execute(
        "DELETE FROM package_batch WHERE HarvestBatchID = ?",
        [harvestBatchId]
      );
      
      // Delete from crop_farm table
      await connection.execute(
        "DELETE FROM `crop farm` WHERE CropID = ?",
        [id]
      );
      
      // Delete from cropsow table
      await connection.execute(
        "DELETE FROM cropsow WHERE CropID = ?",
        [id]
      );
      
      // Delete from harvest table
      await connection.execute(
        "DELETE FROM harvest WHERE CropID = ?",
        [id]
      );
    }
    
    // Finally delete from crop table
    await connection.execute(
      "DELETE FROM crop WHERE CropID = ?",
      [id]
    );
    
    await connection.commit();
    
    res.json({ message: "Agricultural product deleted successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting agricultural product:", error);
    res.status(500).json({ error: "Failed to delete agricultural product" });
  } finally {
    connection.release();
  }
});

// ============= TRACKING HARVESTED CROPS ENDPOINTS =============

// Get tracking harvested crops data
app.get("/api/tracking-harvested-crops", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        CONCAT('PR', c.CropID) as Product_ID,
        c.Seed_Type as Product_Name,
        h.HarvestBatchID as Batch_ID,
        h.Crop_Quantity as Quantity_kg,
        CASE 
          WHEN h.Requirement_Temperature < 50 THEN 'Cold'
          ELSE 'Dry'
        END as Storage_Condition,
        h.Harvest_Date as Storage_Date
      FROM harvest h
      JOIN crop c ON h.CropID = c.CropID
      ORDER BY h.Harvest_Date DESC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching tracking harvested crops:", error);
    res.status(500).json({ error: "Failed to fetch tracking harvested crops" });
  }
});

// ============= PRE-HARVEST MONITORING ENDPOINTS =============

// Get pre-harvest monitoring data
app.get("/api/pre-harvest-monitoring", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        CONCAT('PR', c.CropID) as Product_ID,
        c.Seed_Type as Product_Name,
        h.HarvestBatchID as Batch_ID,
        cs.Fertilzer as Fertilizer_Name,
        cs.Fertilizer_Quantity as Total_Fertilizer_Quantity,
        cs.Pesticide as Pesticide_Name,
        cs.Pesticide_Quantity as Total_Pesticide_Quantity,
        GROUP_CONCAT(DISTINCT cs.Use_Date ORDER BY cs.Use_Date SEPARATOR ', ') as All_Fertilizing_Dates,
        GROUP_CONCAT(DISTINCT cs.Use_Date ORDER BY cs.Use_Date SEPARATOR ', ') as All_Pesticiding_Dates
      FROM cropsow cs
      JOIN crop c ON cs.CropID = c.CropID
      JOIN harvest h ON cs.HarvestBatchID = h.HarvestBatchID
      GROUP BY c.CropID, h.HarvestBatchID, cs.Fertilzer, cs.Pesticide
    `);
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching pre-harvest monitoring:", error);
    res.status(500).json({ error: "Failed to fetch pre-harvest monitoring" });
  }
});

// ============= POST-HARVEST MONITORING ENDPOINTS =============

// Get total stock level data
app.get("/api/total-stock-level", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        h.HarvestBatchID as Batch_Number,
        c.Seed_Type as Product_Name,
        h.Crop_Quantity as Total_Stock_Level_kg,
        w.Maximum_capacity as Max_Capacity_kg,
        ROUND((h.Crop_Quantity / w.Maximum_capacity) * 100, 2) as Stock_Percentage
      FROM harvest h
      JOIN crop c ON h.CropID = c.CropID
      JOIN warehouse w ON h.WarehouseID = w.WarehouseID
      ORDER BY h.HarvestBatchID
    `);
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching total stock level:", error);
    res.status(500).json({ error: "Failed to fetch total stock level" });
  }
});

// Get warehouse location data
app.get("/api/warehouse-location", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        CONCAT('PR', c.CropID) as Product_ID,
        c.Seed_Type as Product_Name,
        h.Crop_Quantity as Quantity_kg,
        CONCAT(w.Warehouse_name, ' - ', w.Warehouse_address) as Location_of_Warehouse
      FROM harvest h
      JOIN crop c ON h.CropID = c.CropID
      JOIN warehouse w ON h.WarehouseID = w.WarehouseID
      ORDER BY c.CropID, w.WarehouseID
    `);
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching warehouse location:", error);
    res.status(500).json({ error: "Failed to fetch warehouse location" });
  }
});

// ============= SPOILAGE AND WASTE CONTROL ENDPOINTS =============

// Get FEFO products data
app.get("/api/fefo-products", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        CONCAT('PR', c.CropID) as Product_ID,
        c.Seed_Type as Product_Name,
        h.HarvestBatchID as Batch_Number,
        p.Expire_date as Expiry_Date,
        h.Crop_Quantity as Quantity_kg,
        DATEDIFF(p.Expire_date, CURDATE()) as Days_to_Expiry
      FROM package_batch p
      JOIN harvest h ON p.HarvestBatchID = h.HarvestBatchID
      JOIN crop c ON h.CropID = c.CropID
      WHERE p.Expire_date > CURDATE()
      ORDER BY p.Expire_date ASC
      LIMIT 10
    `);
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching FEFO products:", error);
    res.status(500).json({ error: "Failed to fetch FEFO products" });
  }
});

// Get FIFO products data
app.get("/api/fifo-products", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        CONCAT('PR', c.CropID) as Product_ID,
        c.Seed_Type as Product_Name,
        h.HarvestBatchID as Batch_Number,
        h.Harvest_Date as Entry_Date,
        h.Crop_Quantity as Quantity_kg,
        DATEDIFF(CURDATE(), h.Harvest_Date) as Days_in_Storage
      FROM harvest h
      JOIN crop c ON h.CropID = c.CropID
      ORDER BY h.Harvest_Date ASC
      LIMIT 10
    `);
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching FIFO products:", error);
    res.status(500).json({ error: "Failed to fetch FIFO products" });
  }
});

// ============= PERISHABLE PRODUCTS ENDPOINTS =============

// Get perishable products data
app.get("/api/perishable-products", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        CONCAT('PP', c.CropID) as Product_ID,
        c.Seed_Type as Product_Name,
        h.HarvestBatchID as Batch_ID,
        p.Expire_date as Expiry_Date,
        h.Requirement_Temperature as Storage_Temperature,
        (SELECT AVG(Humidity) FROM sensordata s WHERE s.WarehouseID = h.WarehouseID) as Humidity
      FROM package_batch p
      JOIN harvest h ON p.HarvestBatchID = h.HarvestBatchID
      JOIN crop c ON h.CropID = c.CropID
      WHERE p.Expire_date IS NOT NULL
      ORDER BY p.Expire_date ASC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching perishable products:", error);
    res.status(500).json({ error: "Failed to fetch perishable products" });
  }
});

// ============= STORAGE CONDITIONS ENDPOINTS =============

// Get storage conditions data
app.get("/api/storage-conditions", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        CONCAT('SC', c.CropID) as Product_ID,
        c.Seed_Type as Product_Name,
        h.HarvestBatchID as Batch_ID,
        h.Requirement_Temperature as Temperature,
        (SELECT AVG(Humidity) FROM sensordata s WHERE s.WarehouseID = h.WarehouseID) as Humidity,
        'Moderate' as Ventilation,
        'Low' as Light_Exposure
      FROM harvest h
      JOIN crop c ON h.CropID = c.CropID
      ORDER BY c.CropID
    `);
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching storage conditions:", error);
    res.status(500).json({ error: "Failed to fetch storage conditions" });
  }
});

// ============= REFERENCE DATA ENDPOINTS =============

// Get farmers for dropdowns
app.get("/api/farmers", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT FarmerID, Farmer_Name FROM farm");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching farmers:", error);
    res.status(500).json({ error: "Failed to fetch farmers" });
  }
});

// Get warehouses for dropdowns
app.get("/api/warehouses", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT WarehouseID, Warehouse_name, Maximum_capacity, Occupide_storage FROM warehouse");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    res.status(500).json({ error: "Failed to fetch warehouses" });
  }
});

// Get crops for dropdowns
app.get("/api/crops", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT CropID, Seed_Type FROM crop");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching crops:", error);
    res.status(500).json({ error: "Failed to fetch crops" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Admin Server running on http://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
});