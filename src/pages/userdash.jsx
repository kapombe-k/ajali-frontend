import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils";

export default function UserDashboard() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const user_id = localStorage.getItem("user_id"); // Set during login
    const access_token = localStorage.getItem("token");

    const fetchReports = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/users/${user_id}/reports`, {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });

            if (!response.ok) throw new Error("Failed to fetch");

            const data = await response.json();
            setReports(data);
        } catch (err) {
            setError(err.message);
            toast.error("Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    const deleteReport = async (reportId) => {
        try {
            const response = await fetch(`${BASE_URL}/api/reports/${reportId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });

            if (!response.ok) throw new Error("Delete failed");

            toast.success("Report deleted");
            fetchReports(); // Refresh list
        } catch (err) {
            toast.error(err.message);
        }
    };

    useEffect(() => { fetchReports(); }, []);

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-red-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-red-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6 mb-8">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-blue-300">My Reports</h2>
                        <button
                            onClick={() => navigate('/map')}
                            className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            New Report
                        </button>
                    </div>
                </div>

                {/* Content */}
                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                {reports.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-xl font-medium text-gray-300 mb-2">No reports found</h3>
                        <button
                            onClick={() => navigate('/map')}
                            className="bg-blue-700 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            Create Your First Report
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reports.map((report) => (
                            <div key={report.id} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden hover:border-blue-500/50 transition-all">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-semibold text-white truncate">
                                            {report.title}
                                        </h3>
                                        <span className="bg-gray-700 rounded-lg px-2 py-1 text-xs border border-gray-600">
                                            ID: {report.id.toString().slice(-6)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${report.status === "pending" ? "bg-yellow-500/20 text-yellow-300" :
                                                report.status === "under investigation" ? "bg-blue-500/20 text-blue-300" :
                                                    report.status === "resolved" ? "bg-green-500/20 text-green-300" :
                                                        "bg-gray-500/20 text-gray-300"
                                            }`}>
                                            {report.status.replace("_", " ")}
                                        </span>
                                        <span className="text-gray-400 text-sm">
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <p className="text-gray-300 text-sm mb-6 line-clamp-3">
                                        {report.description}
                                    </p>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => navigate(`/reports/${report.id}`)}
                                            className="flex-1 bg-blue-700 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                                        >
                                            View Details
                                        </button>
                                        <button
                                            onClick={() => deleteReport(report.id)}
                                            className="flex-1 bg-red-900/50 hover:bg-red-800/50 text-red-300 py-2 px-4 rounded-lg transition-colors text-sm border border-red-800/50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}