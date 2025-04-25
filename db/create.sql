-- Create the Drinks table
CREATE TABLE Drinks (
    DrinkID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Price REAL NOT NULL,
    CurrentStock INTEGER NOT NULL,
    MinThreshold INTEGER NOT NULL,
    Capacity INTEGER NOT NULL
);

-- Create the Sales table (Amount remains nullable so we can compute it in the trigger)
CREATE TABLE Sales (
    SaleID INTEGER PRIMARY KEY AUTOINCREMENT,
    DrinkID INTEGER NOT NULL,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    Quantity INTEGER NOT NULL,
    PaymentMethod TEXT NOT NULL,
    Amount REAL,
    FOREIGN KEY (DrinkID) REFERENCES Drinks(DrinkID) ON DELETE CASCADE
);

-- Create the Requests table
CREATE TABLE Requests (
    RequestID INTEGER PRIMARY KEY AUTOINCREMENT,
    Type TEXT CHECK(Type IN ('Refill', 'CashCollection', 'Maintenance')) NOT NULL,
    DrinkID INTEGER,
    AmountOrQuantity INTEGER NOT NULL,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK(Status IN ('Pending', 'Urgent', 'Completed')) NOT NULL,
    AssignedTo INTEGER,
    CompletedBy INTEGER,
    CompletionTime DATETIME,
    FOREIGN KEY (DrinkID) REFERENCES Drinks(DrinkID) ON DELETE CASCADE,
    FOREIGN KEY (AssignedTo) REFERENCES DeliveryPersonnel(PersonID) ON DELETE CASCADE,
    FOREIGN KEY (CompletedBy) REFERENCES DeliveryPersonnel(PersonID) ON DELETE CASCADE
);

-- Create the DeliveryPersonnel table
CREATE TABLE DeliveryPersonnel (
    PersonID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Email TEXT UNIQUE NOT NULL,
    Phone TEXT NOT NULL,
    Zone TEXT NOT NULL
);

-- Create the MachineLogs table
CREATE TABLE MachineLogs (
    LogID INTEGER PRIMARY KEY AUTOINCREMENT,
    EventType TEXT CHECK(EventType IN ('Sale', 'Refill', 'CashLevelUpdate', 'Error')) NOT NULL,
    Details TEXT NOT NULL,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    CashLevel REAL NOT NULL
);

-- Create the Actions table
CREATE TABLE Actions (
    ActionID INTEGER PRIMARY KEY AUTOINCREMENT,
    Type TEXT CHECK(Type IN ('Refill', 'CashCollection')) NOT NULL,
    DrinkID INTEGER,
    PersonID INTEGER NOT NULL,
    AmountOrQuantity INTEGER NOT NULL,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (DrinkID) REFERENCES Drinks(DrinkID) ON DELETE CASCADE,
    FOREIGN KEY (PersonID) REFERENCES DeliveryPersonnel(PersonID) ON DELETE CASCADE
);

-- Combined trigger: ProcessSale calculates Amount, updates stock, and logs cash sales.
DROP TRIGGER IF EXISTS ProcessSale;
CREATE TRIGGER ProcessSale
AFTER INSERT ON Sales
FOR EACH ROW
BEGIN
    -- Calculate and update the sale Amount if it's NULL.
    UPDATE Sales
    SET Amount = (SELECT Price * NEW.Quantity FROM Drinks WHERE DrinkID = NEW.DrinkID)
    WHERE SaleID = NEW.SaleID;
    
    -- Update Drinks stock.
    UPDATE Drinks
    SET CurrentStock = CurrentStock - NEW.Quantity
    WHERE DrinkID = NEW.DrinkID;
    
    -- If PaymentMethod is 'Cash', update MachineLogs with new cash level.
    -- The new cash level is computed as: current max CashLevel (or 0 if none) + computed sale Amount.
    INSERT INTO MachineLogs (EventType, Details, CashLevel, Timestamp)
    VALUES (
      'CashLevelUpdate',
      'Cash sale added',
      (SELECT COALESCE(MAX(CashLevel), 0) FROM MachineLogs) + 
        (SELECT Price * NEW.Quantity FROM Drinks WHERE DrinkID = NEW.DrinkID),
      CURRENT_TIMESTAMP
    );
END;

-- Generate Refill Request when stock is low.
DROP TRIGGER IF EXISTS GenerateRefillRequest;
CREATE TRIGGER GenerateRefillRequest
AFTER UPDATE OF CurrentStock ON Drinks
FOR EACH ROW
WHEN NEW.CurrentStock <= NEW.MinThreshold
BEGIN
    INSERT INTO Requests (Type, DrinkID, AmountOrQuantity, Timestamp, Status)
    VALUES ('Refill', NEW.DrinkID, NEW.Capacity - NEW.CurrentStock, CURRENT_TIMESTAMP, 'Pending');
END;

-- Generate Cash Collection Request when Cash Level is high.
DROP TRIGGER IF EXISTS GenerateCashCollectionRequest;
CREATE TRIGGER GenerateCashCollectionRequest
AFTER INSERT ON MachineLogs
FOR EACH ROW
WHEN NEW.EventType = 'CashLevelUpdate' AND NEW.CashLevel >= 200
BEGIN
    INSERT INTO Requests (Type, AmountOrQuantity, Timestamp, Status)
    VALUES ('CashCollection', NEW.CashLevel, CURRENT_TIMESTAMP, 'Pending');
END;
