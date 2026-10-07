import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const Clients = () => {
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    
    const [clients, setClients] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    
    // --- NEW: Examine Modal State ---
    const [showExamineModal, setShowExamineModal] = useState(false);
    const [selectedVisitId, setSelectedVisitId] = useState(null);
    const [examineData, setExamineData] = useState({
        doctor_diagnosis: "",
        treatment_plan: ""
    });

    const fetchClients = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/clients`);
            const data = await response.json();
            setClients(data);
        } catch (error) {
            console.error("Failed to fetch clients:", error);
        }
    }

    useEffect(() => {
        fetchClients();
    }, []);

    // --- NEW: Examination Functions ---
    const handleExamineChange = (e) => {
        setExamineData({ ...examineData, [e.target.name]: e.target.value });
    };

    const handleExamineSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/visit/${selectedVisitId}/examine`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(examineData)
            });

            if (response.ok) {
                setShowExamineModal(false);
                setExamineData({ doctor_diagnosis: "", treatment_plan: "" });
                fetchClients(); // Refresh the list so the patient drops off 'Pending'
            } else {
                alert("Failed to save examination.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const backbtn = () => { navigate("/dhome"); }
    const handleSearch = (e) => { setSearchQuery(e.target.value); }

    const filteredClients = clients.filter((client) =>
        client.client_fullname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getPriorityBadge = (priority, status) => {
        if (status === 'Discharged') return <span className="badge bg-secondary ms-2">Discharged</span>;
        if (priority === 0) return <span className="badge bg-danger ms-2">🔴 CRITICAL</span>;
        if (priority === 1) return <span className="badge bg-warning text-dark ms-2">🟡 URGENT</span>;
        if (priority === 2) return <span className="badge bg-success ms-2">🟢 STABLE</span>;
        return <span className="badge bg-secondary ms-2">Awaiting Triage</span>;
    };

    return (
    <>
        <h1 className="text-center mt-3">Healthly Health Care System</h1>
        <div className="text-start py-4 px-4">
            <button className="btn btn-outline-secondary" type="button" onClick={backbtn}>Back</button>
        </div>
        <div className="container">
            <input type="text" className="form-control mb-4" placeholder="Search patients..." value={searchQuery} onChange={handleSearch} />

            <div className="row">
                {filteredClients.map((client) => (
                    <div className="col-md-4 mb-4" key={client.client_id}>
                        <div className="p-4 rounded shadow-sm" style={{backgroundColor: "#f1f3f5", border: "1px solid #dee2e6", minHeight: "220px"}}>
                            
                            <h5 style={{ color: "#495057" }}>
                                {client.client_fullname} 
                                {getPriorityBadge(client.triage_priority, client.status)}
                            </h5>
                            
                            <p className="mb-1 text-muted"><small>ID: {client.identification_no} | Tel: {client.phone_no}</small></p>
                            
                            {client.symptoms && (
                                <div className="alert alert-light p-2 mb-3 border">
                                    <strong>Symptoms: </strong><br/>
                                    <small>{client.symptoms}</small>
                                </div>
                            )}
                            
                            {/* Only show the Examine button if they have an active Pending visit */}
                            {client.status === 'Pending' && client.visit_id ? (
                                <button 
                                    className="btn btn-sm w-100 mt-2" 
                                    style={{ backgroundColor: '#8DABCE', color: 'white' }}
                                    onClick={() => {
                                        setSelectedVisitId(client.visit_id);
                                        setShowExamineModal(true);
                                    }}
                                >
                                    Examine Patient
                                </button>
                            ) : (
                                <p className="text-muted text-center mt-3 mb-0"><small>No pending action required.</small></p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* --- EXAMINATION MODAL --- */}
            {showExamineModal && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow-lg">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title">Clinical Examination</h5>
                                <button type="button" className="btn-close" onClick={() => setShowExamineModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleExamineSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Official Diagnosis</label>
                                        <input 
                                            type="text" 
                                            name="doctor_diagnosis" 
                                            className="form-control" 
                                            value={examineData.doctor_diagnosis} 
                                            onChange={handleExamineChange} 
                                            placeholder="e.g. Acute Bronchitis"
                                            required 
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">Treatment & Discharge Plan</label>
                                        <textarea 
                                            name="treatment_plan" 
                                            className="form-control" 
                                            rows="3"
                                            value={examineData.treatment_plan} 
                                            onChange={handleExamineChange} 
                                            placeholder="e.g. Prescribed Amoxicillin, rest for 3 days."
                                            required 
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-success w-100 py-2">
                                        Save Diagnosis & Discharge
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </>
    );
}

export default Clients;