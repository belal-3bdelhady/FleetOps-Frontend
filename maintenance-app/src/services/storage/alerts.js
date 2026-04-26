const alertsData = {
    odometer: [
        {
            id: "A-101",
            vehiclePlate: "ABC-1234",
            vehicleModel: "Ford F-150",
            lastServiceKM: "45,000",
            currentOdometer: "54,800",
            kmSinceService: "9,800",
            threshold: "10,000",
            status: "warning"
        },
        {
            id: "A-102",
            vehiclePlate: "XYZ-9876",
            vehicleModel: "Mercedes Sprinter",
            lastServiceKM: "80,000",
            currentOdometer: "82,000",
            kmSinceService: "2,000",
            threshold: "10,000",
            status: "success"
        },
        {
            id: "A-103",
            vehiclePlate: "DEF-3321",
            vehicleModel: "Volvo VNL",
            lastServiceKM: "205,000",
            currentOdometer: "210,000",
            kmSinceService: "5,000",
            threshold: "10,000",
            status: "success"
        }
    ],
    insurance: [
        {
            id: "A-201",
            vehiclePlate: "FLT-7721",
            vehicleModel: "Scania R500",
            policyNumber: "POL-990234",
            expiryDate: "2026-05-15",
            daysRemaining: "19",
            status: "warning"
        },
        {
            id: "A-202",
            vehiclePlate: "GHI-5544",
            vehicleModel: "Ford Transit",
            policyNumber: "POL-881231",
            expiryDate: "2024-12-01",
            daysRemaining: "215",
            status: "success"
        },
        {
            id: "A-203",
            vehiclePlate: "LMN-4567",
            vehicleModel: "Toyota Prius",
            policyNumber: "POL-772341",
            expiryDate: "2024-08-20",
            daysRemaining: "112",
            status: "success"
        },
        {
            id: "A-204",
            vehiclePlate: "JKL-7788",
            vehicleModel: "Honda Civic",
            policyNumber: "POL-112233",
            expiryDate: "2025-03-01",
            daysRemaining: "305",
            status: "success"
        }
    ],
    inspection: [
        {
            id: "A-301",
            vehiclePlate: "TKR-4412",
            vehicleModel: "MAN TGX",
            lastInspection: "2023-04-20",
            nextDueDate: "2024-04-20",
            daysRemaining: "Overdue",
            status: "danger"
        },
        {
            id: "A-302",
            vehiclePlate: "ABC-1234",
            vehicleModel: "Ford F-150",
            lastInspection: "2024-03-15",
            nextDueDate: "2025-03-15",
            daysRemaining: "323",
            status: "success"
        }
    ],
    parts: [
        {
            id: "A-401",
            vehiclePlate: "VLV-0023",
            vehicleModel: "Volvo FM",
            partName: "Brake Pads (Front)",
            installDate: "2023-11-10",
            usage: "12,400 km",
            lifespan: "15,000 km",
            status: "warning"
        }
    ]
};

export default alertsData;
