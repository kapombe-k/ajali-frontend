import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import { BASE_URL } from "../utils";

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Status mapping
const statusMap = {
    "Pending": "pending",
    "In Progress": "under investigation",
    "Resolved": "resolved"
};

export default function ReportDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const access_token = localStorage.getItem("token")

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/reports/${id}`, {
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    }
                });

                if (!response.ok) throw new Error("Failed to fetch report");

                const data = await response.json();
                setReport(data);

                // Convert backend status to frontend display value
                setStatus(
                    Object.entries(statusMap).find(
                        ([_, v]) => v === data.status
                    )?.[0] || "Pending"
                );

            } catch (err) {
                toast.error(err.message);
                navigate("/reports");
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [id, navigate]);

    const handleStatusUpdate = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/reports/${id}/status`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${access_token}`
                },
                body: JSON.stringify({
                    status: statusMap[status] // Convert to backend format
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Update failed");
            }

            toast.success("Status updated successfully!");
            navigate("/reports");
        } catch (err) {
            toast.error(`Update failed: ${err.message}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-red-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-red-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors"
                >
                    ← Back to Reports
                </button>

                {report && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Incident Details */}
                        <div className="space-y-6">
                            {/* Status Update Section */}
                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
                                <h2 className="text-xl font-bold text-blue-300 mb-4">Update Status</h2>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {Object.keys(statusMap).map((option) => (
                                        <button
                                            key={option}
                                            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${status === option
                                                    ? "bg-blue-700 border-blue-500 text-white"
                                                    : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                                                } border`}
                                            onClick={() => setStatus(option)}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={!status}
                                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${!status ? "bg-gray-600 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-600"
                                        } text-white`}
                                >
                                    Confirm Update
                                </button>
                            </div>

                            {/* Other details sections... */}
                        </div>

                        {/* Right Column - Map */}
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
                            <h2 className="text-xl font-bold text-blue-300 mb-4">Location</h2>
                            <div className="h-96 rounded-xl overflow-hidden mb-4 border border-gray-700">
                                <MapContainer
                                    center={[report.latitude, report.longitude]}
                                    zoom={15}
                                    className="h-full w-full"
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={[report.latitude, report.longitude]}>
                                        <Popup>Incident Location</Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}