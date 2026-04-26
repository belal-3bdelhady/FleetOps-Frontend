export const INVENTORY_STORAGE_KEY = 'fleetops_inventory';

export const initialMockData = [
    // --- Engine Parts ---
    {
        id: "PRT-1003",
        name: "Spark Plug Platinum",
        sku: "SKU-10002",
        category: "Engine Parts",
        quantity: 120,
        minThreshold: 40,
        maxLevel: 200,
        unitPrice: 85.00,
        location: "Warehouse A, Row 1",
        supplier: "NGK Spark Co.",
        lastRestocked: "2026-02-20T00:00:00Z",
        monthlyUsage: [80, 95, 110, 88, 105, 99]
    },
    {
        id: "PRT-1004",
        name: "Timing Belt Kit",
        sku: "SKU-10003",
        category: "Engine Parts",
        quantity: 8,
        minThreshold: 10, // Under Threshold
        maxLevel: 30,
        unitPrice: 1200.00,
        location: "Warehouse B, Row 4",
        supplier: "Gates Corp",
        lastRestocked: "2026-01-05T00:00:00Z",
        monthlyUsage: [5, 4, 6, 7, 5, 8]
    },
    {
        id: "PRT-1005",
        name: "Air Filter High Flow",
        sku: "SKU-10004",
        category: "Engine Parts",
        quantity: 45,
        minThreshold: 20,
        maxLevel: 100,
        unitPrice: 320.00,
        location: "Warehouse A, Row 3",
        supplier: "Global Auto Parts",
        lastRestocked: "2026-03-28T00:00:00Z",
        monthlyUsage: [15, 18, 22, 19, 25, 20]
    },

    // --- Brakes & Suspension ---
    {
        id: "PRT-1006",
        name: "Brake Rotor (Rear)",
        sku: "SKU-10005",
        category: "Brakes",
        quantity: 14,
        minThreshold: 15, // Low Stock
        maxLevel: 40,
        unitPrice: 850.00,
        location: "Warehouse A, Row 2",
        supplier: "StopTech Inc.",
        lastRestocked: "2026-02-15T00:00:00Z",
        monthlyUsage: [10, 12, 11, 14, 15, 13]
    },
    {
        id: "PRT-1007",
        name: "Shock Absorber (Front)",
        sku: "SKU-10006",
        category: "Suspension",
        quantity: 12,
        minThreshold: 8,
        maxLevel: 24,
        unitPrice: 2100.00,
        location: "Warehouse C, Row 1",
        supplier: "Monroe Systems",
        lastRestocked: "2026-04-01T00:00:00Z",
        monthlyUsage: [4, 5, 3, 6, 4, 5]
    },

    // --- Electrical ---
    {
        id: "PRT-1008",
        name: "Alternator 90A",
        sku: "SKU-10007",
        category: "Electrical",
        quantity: 5,
        minThreshold: 5,
        maxLevel: 15,
        unitPrice: 3400.00,
        location: "Warehouse B, Rack 2",
        supplier: "Bosch Automotive",
        lastRestocked: "2025-12-20T00:00:00Z",
        monthlyUsage: [2, 3, 1, 2, 4, 2]
    },
    {
        id: "PRT-1009",
        name: "LED Headlight Bulb H7",
        sku: "SKU-10008",
        category: "Electrical",
        quantity: 60,
        minThreshold: 20,
        maxLevel: 150,
        unitPrice: 450.00,
        location: "Warehouse B, Rack 3",
        supplier: "Philips Lighting",
        lastRestocked: "2026-04-12T00:00:00Z",
        monthlyUsage: [30, 45, 50, 42, 38, 55]
    },

    // --- Transmission & Drive ---
    {
        id: "PRT-1010",
        name: "Clutch Kit Heavy Duty",
        sku: "SKU-10009",
        category: "Transmission",
        quantity: 3,
        minThreshold: 5, // Out of Stock Risk
        maxLevel: 10,
        unitPrice: 5600.00,
        location: "Warehouse C, Row 5",
        supplier: "Exedy Corp",
        lastRestocked: "2026-01-15T00:00:00Z",
        monthlyUsage: [1, 2, 1, 3, 2, 1]
    },
    {
        id: "PRT-1011",
        name: "CV Axle Assembly",
        sku: "SKU-10010",
        category: "Transmission",
        quantity: 9,
        minThreshold: 4,
        maxLevel: 20,
        unitPrice: 1800.00,
        location: "Warehouse C, Row 2",
        supplier: "GSP North America",
        lastRestocked: "2026-03-05T00:00:00Z",
        monthlyUsage: [3, 2, 4, 3, 5, 2]
    },

    // --- Cooling System ---
    {
        id: "PRT-1012",
        name: "Radiator Fan Assembly",
        sku: "SKU-10011",
        category: "Cooling",
        quantity: 7,
        minThreshold: 5,
        maxLevel: 15,
        unitPrice: 1250.00,
        location: "Warehouse B, Rack 4",
        supplier: "Denso",
        lastRestocked: "2026-03-20T00:00:00Z",
        monthlyUsage: [2, 4, 3, 2, 5, 3]
    },
    {
        id: "PRT-1013",
        name: "Water Pump",
        sku: "SKU-10012",
        category: "Cooling",
        quantity: 22,
        minThreshold: 10,
        maxLevel: 40,
        unitPrice: 950.00,
        location: "Warehouse B, Rack 4",
        supplier: "Aisin World",
        lastRestocked: "2026-04-05T00:00:00Z",
        monthlyUsage: [8, 10, 7, 9, 12, 11]
    },

    // --- Tires & Wheels ---
    {
        id: "PRT-1014",
        name: "All-Season Tire 205/55R16",
        sku: "SKU-10013",
        category: "Tires",
        quantity: 48,
        minThreshold: 20,
        maxLevel: 100,
        unitPrice: 2200.00,
        location: "Outdoor Yard A",
        supplier: "Michelin",
        lastRestocked: "2026-04-18T00:00:00Z",
        monthlyUsage: [20, 24, 30, 28, 35, 40]
    },
    {
        id: "PRT-1016",
        name: "Wheel Bearing (Front)",
        sku: "SKU-10015",
        category: "Suspension",
        quantity: 18,
        minThreshold: 10,
        maxLevel: 50,
        unitPrice: 650.00,
        location: "Warehouse C, Row 3",
        supplier: "SKF Group",
        lastRestocked: "2026-03-10T00:00:00Z",
        monthlyUsage: [12, 14, 10, 15, 13, 11]
    },
    {
        id: "PRT-1017",
        name: "Brake Fluid DOT 4 (1L)",
        sku: "SKU-10016",
        category: "Fluids",
        quantity: 85,
        minThreshold: 30,
        maxLevel: 200,
        unitPrice: 120.00,
        location: "Warehouse A, Row 5",
        supplier: "Castrol",
        lastRestocked: "2026-04-01T00:00:00Z",
        monthlyUsage: [40, 55, 48, 60, 52, 58]
    },
    {
        id: "PRT-1018",
        name: "Coolant Pink (5L)",
        sku: "SKU-10017",
        category: "Fluids",
        quantity: 42,
        minThreshold: 20,
        maxLevel: 100,
        unitPrice: 350.00,
        location: "Warehouse A, Row 5",
        supplier: "Toyota Genuine",
        lastRestocked: "2026-02-28T00:00:00Z",
        monthlyUsage: [15, 20, 25, 22, 18, 20]
    },
    {
        id: "PRT-1019",
        name: "Oxygen Sensor",
        sku: "SKU-10018",
        category: "Electrical",
        quantity: 0, // Out of Stock
        minThreshold: 5,
        maxLevel: 20,
        unitPrice: 1100.00,
        location: "Warehouse B, Rack 2",
        supplier: "Denso",
        lastRestocked: "2025-11-15T00:00:00Z",
        monthlyUsage: [4, 6, 5, 7, 4, 5]
    },
    {
        id: "PRT-1020",
        name: "Fuel Injector Set",
        sku: "SKU-10019",
        category: "Engine Parts",
        quantity: 15,
        minThreshold: 5,
        maxLevel: 30,
        unitPrice: 4800.00,
        location: "Warehouse B, Row 4",
        supplier: "Bosch Automotive",
        lastRestocked: "2026-03-30T00:00:00Z",
        monthlyUsage: [2, 3, 2, 4, 3, 5]
    },
    {
        id: "PRT-1021",
        name: "Wiper Blade Set (24/18)",
        sku: "SKU-10020",
        category: "Accessories",
        quantity: 200,
        minThreshold: 50,
        maxLevel: 500,
        unitPrice: 180.00,
        location: "Warehouse A, Row 10",
        supplier: "Rain-X",
        lastRestocked: "2026-04-15T00:00:00Z",
        monthlyUsage: [120, 150, 140, 110, 95, 130]
    }
];
export let inventoryMockData = [...initialMockData];