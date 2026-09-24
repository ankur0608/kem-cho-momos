// --- Utility Functions ---
export const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
        case "new":
            return "bg-yellow-100 text-yellow-700";
        case "completed":
            return "bg-emerald-100 text-emerald-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
};