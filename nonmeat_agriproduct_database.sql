-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 29, 2025 at 06:32 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nonmeat agriproduct database`
--

-- --------------------------------------------------------

--
-- Table structure for table `crop`
--

CREATE TABLE `crop` (
  `CropID` int(11) NOT NULL,
  `Seed_Type` varchar(50) NOT NULL,
  `Sowing date` date NOT NULL,
  `Expected Harvest Date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `crop farm`
--

CREATE TABLE `crop farm` (
  `CropID` int(11) NOT NULL,
  `FarmerID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cropsow`
--

CREATE TABLE `cropsow` (
  `RecordID` int(11) NOT NULL,
  `Fertilzer` varchar(50) NOT NULL,
  `Fertilizer Quantity` int(11) NOT NULL,
  `Pesticide` varchar(50) NOT NULL,
  `Pesticide Quantity` int(11) NOT NULL,
  `Use  Date` date NOT NULL,
  `FarmerID` int(11) NOT NULL,
  `CropID` int(11) NOT NULL,
  `HarvestBatchID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `CustomerID` int(11) NOT NULL,
  `Name` varchar(50) NOT NULL,
  `Address` varchar(50) NOT NULL,
  `Contact` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `factory`
--

CREATE TABLE `factory` (
  `FactoryID` int(11) NOT NULL,
  `Factory name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `farm`
--

CREATE TABLE `farm` (
  `FarmerID` int(11) NOT NULL,
  `Farmer_Name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `harvest`
--

CREATE TABLE `harvest` (
  `HarvestBatchID` int(11) NOT NULL,
  `Harvest Date` date NOT NULL,
  `Requirement Temperature` decimal(10,0) NOT NULL,
  `Shelf Life` int(11) NOT NULL,
  `Season` varchar(50) NOT NULL,
  `Crop Quantity` int(11) NOT NULL,
  `FarmerID` int(11) NOT NULL,
  `WarehouseID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order`
--

CREATE TABLE `order` (
  `OrderID` int(11) NOT NULL,
  `Order Quantity` int(11) NOT NULL,
  `Order date` date NOT NULL,
  `CustomerID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order details`
--

CREATE TABLE `order details` (
  `CustomerID` int(11) NOT NULL,
  `OrderID` int(11) NOT NULL,
  `ProductID` int(11) NOT NULL,
  `Order date` date NOT NULL,
  `Customer address` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `organic product`
--

CREATE TABLE `organic product` (
  `ProductID` int(11) NOT NULL,
  `Product name` varchar(50) NOT NULL,
  `FactoryID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `package batch`
--

CREATE TABLE `package batch` (
  `ProductPackageBatchID` int(11) NOT NULL,
  `Product name` varchar(50) NOT NULL,
  `Expire date` date NOT NULL,
  `Process date` date NOT NULL,
  `Package type` varchar(50) NOT NULL,
  `FactoryID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `packagebatch packageproduct`
--

CREATE TABLE `packagebatch packageproduct` (
  `ProductPackageBatchID` int(11) NOT NULL,
  `PackageProductID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `package product`
--

CREATE TABLE `package product` (
  `PackageProducrID` int(11) NOT NULL,
  `Product name` varchar(50) NOT NULL,
  `OrderID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sensordata`
--

CREATE TABLE `sensordata` (
  `SensorID` int(11) NOT NULL,
  `Temoerature` int(11) NOT NULL,
  `Humidity` int(11) NOT NULL,
  `WarehouseID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shipment`
--

CREATE TABLE `shipment` (
  `ShipmentID` int(11) NOT NULL,
  `Crop name` varchar(5) NOT NULL,
  `Packet type` varchar(50) NOT NULL,
  `Crop Quantity` int(11) NOT NULL,
  `Shipment Date` date NOT NULL,
  `WarehouseID` int(11) NOT NULL,
  `FactoryID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `warehouse`
--

CREATE TABLE `warehouse` (
  `WarehouseID` int(11) NOT NULL,
  `Warehouse name` varchar(50) NOT NULL,
  `Maximum capacity` int(11) NOT NULL,
  `Occupide storage` int(11) NOT NULL,
  `Warehouse address` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `crop`
--
ALTER TABLE `crop`
  ADD PRIMARY KEY (`CropID`);

--
-- Indexes for table `crop farm`
--
ALTER TABLE `crop farm`
  ADD PRIMARY KEY (`CropID`,`FarmerID`);

--
-- Indexes for table `cropsow`
--
ALTER TABLE `cropsow`
  ADD PRIMARY KEY (`RecordID`),
  ADD KEY `fk01` (`FarmerID`),
  ADD KEY `fk02` (`CropID`),
  ADD KEY `fk03` (`HarvestBatchID`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`CustomerID`);

--
-- Indexes for table `factory`
--
ALTER TABLE `factory`
  ADD PRIMARY KEY (`FactoryID`);

--
-- Indexes for table `farm`
--
ALTER TABLE `farm`
  ADD PRIMARY KEY (`FarmerID`);

--
-- Indexes for table `harvest`
--
ALTER TABLE `harvest`
  ADD PRIMARY KEY (`HarvestBatchID`);

--
-- Indexes for table `order`
--
ALTER TABLE `order`
  ADD PRIMARY KEY (`OrderID`);

--
-- Indexes for table `order details`
--
ALTER TABLE `order details`
  ADD PRIMARY KEY (`CustomerID`,`OrderID`,`ProductID`);

--
-- Indexes for table `organic product`
--
ALTER TABLE `organic product`
  ADD PRIMARY KEY (`ProductID`);

--
-- Indexes for table `package batch`
--
ALTER TABLE `package batch`
  ADD PRIMARY KEY (`ProductPackageBatchID`);

--
-- Indexes for table `packagebatch packageproduct`
--
ALTER TABLE `packagebatch packageproduct`
  ADD PRIMARY KEY (`ProductPackageBatchID`,`PackageProductID`);

--
-- Indexes for table `package product`
--
ALTER TABLE `package product`
  ADD PRIMARY KEY (`PackageProducrID`);

--
-- Indexes for table `sensordata`
--
ALTER TABLE `sensordata`
  ADD PRIMARY KEY (`SensorID`);

--
-- Indexes for table `shipment`
--
ALTER TABLE `shipment`
  ADD PRIMARY KEY (`ShipmentID`);

--
-- Indexes for table `warehouse`
--
ALTER TABLE `warehouse`
  ADD PRIMARY KEY (`WarehouseID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `crop`
--
ALTER TABLE `crop`
  MODIFY `CropID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `CustomerID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `factory`
--
ALTER TABLE `factory`
  MODIFY `FactoryID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `harvest`
--
ALTER TABLE `harvest`
  MODIFY `HarvestBatchID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order`
--
ALTER TABLE `order`
  MODIFY `OrderID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order details`
--
ALTER TABLE `order details`
  MODIFY `CustomerID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `organic product`
--
ALTER TABLE `organic product`
  MODIFY `ProductID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `package batch`
--
ALTER TABLE `package batch`
  MODIFY `ProductPackageBatchID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `packagebatch packageproduct`
--
ALTER TABLE `packagebatch packageproduct`
  MODIFY `ProductPackageBatchID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `package product`
--
ALTER TABLE `package product`
  MODIFY `PackageProducrID` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cropsow`
--
ALTER TABLE `cropsow`
  ADD CONSTRAINT `fk01` FOREIGN KEY (`FarmerID`) REFERENCES `farm` (`FarmerID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk02` FOREIGN KEY (`CropID`) REFERENCES `crop` (`CropID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk03` FOREIGN KEY (`HarvestBatchID`) REFERENCES `harvest` (`HarvestBatchID`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
