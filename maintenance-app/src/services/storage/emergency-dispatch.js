const emergencyDispatchData = {
    incidents: [
        {
            id: "INC-001",
            status: "Pending",
            driver: {
                name: "Ahmed Mahmoud",
                phone: "+20 100 555 0101"
            },
            location: {
                address: "Ring Road, Nasr City Interchange, Cairo",
                gps: "30.0511°N, 31.3656°E",
                coordinates: { lat: 30.0511, lng: 31.3656 }
            },
            timestamp: "2026-04-09T13:05:00Z",
            timeAgo: "405h 0m ago",
            vehicle: {
                plate: "EGY-7890",
                model: "Volvo FH16",
                type: "heavy"
            },
            issue: "Transmission failure. Vehicle stalled on Ring Road near Nasr City interchange. Engine will not start."
        },
        {
            id: "INC-002",
            status: "Pending",
            driver: {
                name: "Omar Farouk",
                phone: "+20 101 222 3333"
            },
            location: {
                address: "Suez Road, New Cairo, Cairo",
                gps: "30.0611°N, 31.4656°E",
                coordinates: { lat: 30.0611, lng: 31.4656 }
            },
            timestamp: "2026-04-10T10:30:00Z",
            timeAgo: "385h 35m ago",
            vehicle: {
                plate: "EGY-5678",
                model: "Mercedes Actros",
                type: "heavy"
            },
            issue: "Brake system failure. Truck currently parked on the shoulder. Needs immediate inspection."
        }
    ],
    mechanics: [
        {
            id: "M-101",
            name: "Karim Hassan",
            initials: "KH",
            specialty: "Engine",
            phone: "+20 101 987 6543",
            status: "Busy",
            distance: "3.2 km",
            eta: "12 min",
            avatarType: "primary"
        },
        {
            id: "M-102",
            name: "Omar Yusuf",
            initials: "OY",
            specialty: "Electrical",
            phone: "+20 102 555 1234",
            status: "Busy",
            distance: "5.8 km",
            eta: "22 min",
            avatarType: "secondary"
        },
        {
            id: "M-103",
            name: "Ahmed Saleh",
            initials: "AS",
            specialty: "General",
            phone: "+20 103 444 5678",
            status: "Available",
            distance: "9.1 km",
            eta: "35 min",
            avatarType: "tertiary"
        }
    ]
};

export default emergencyDispatchData;
