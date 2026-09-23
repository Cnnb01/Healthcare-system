import Footer from "./Footer";
import { useState } from "react";
import { useNavigate } from "react-router-dom"
const Receptionisthp = () => {
    const API_BASE_URL = "http://localhost:8000"
    const navigate = useNavigate()
    //create new client
    const [newClient, setNewClient] = useState({
        name:"",
        phoneno:"",
        idnum:""
    })
    const handleChange = (e)=>{
        const {name, value} = e.target
        setNewClient((prev)=>{
            return{
                ...prev,
            [name]:value
            }
        })
    }

    const [showModal, setShowModal] = useState(false);
    const handleCreateClient = ()=> {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setNewClient({ name:"", phoneno:"", idnum:"" });
    };

    const handleSaveClient = async() => {
        // console.log("Client to add", newClient);
        try {
            const response = await fetch(`${API_BASE_URL}/client`,{
                method:"POST",
                headers:{
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newClient)
            })
            if(!response.ok){
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error adding client:", error)
        }
        handleCloseModal();
    };

    // view clients
    const [showViewModal, setShowViewModal] = useState(false);
    const [clientList, setClientList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const handleViewClients = async()=>{
        try {
            const response = await fetch(`${API_BASE_URL}/clients`);
            const data = await response.json();
            setClientList(data);
            setShowViewModal(true);
        } catch (error) {
            console.error("Failed to fetch clients:", error);
        }
    }

    const handleCloseViewModal = () => {
        setShowViewModal(false);
        setSearchQuery("");
    };

    const handleSearch = (e)=>{
        setSearchQuery(e.target.value)
    }

    const filteredClients = clientList.filter((client) =>
        client.client_fullname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // visits logging ---
    const [showTriageModal, setShowTriageModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [visitData, setVisitData] = useState({
      age: "",
      pain_level: "",
      temperature: "",
      blood_pressure_sys: "",
      blood_pressure_dia: "",
      heart_rate: "",
      chief_complaint: ""
    });

    const handleOpenTriage = (client) => {
        setSelectedClient(client);
        setShowTriageModal(true);
    };

    const handleCloseTriage = () => {
        setShowTriageModal(false);
        setSelectedClient(null);
        setVisitData({
            temperature: "",
            blood_pressure_sys: "",
            blood_pressure_dia: "",
            heart_rate: "",
            chief_complaint: ""
        });
    };

    const handleVisitChange = (e) => {
        const { name, value } = e.target;
        setVisitData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveVisit = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/visit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    client_id: selectedClient.client_id, // Link to the specific client
                    ...visitData
                })
            });
            if(!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            alert("Vitals logged successfully!");
            handleCloseTriage();
        } catch (error) {
            console.error("Error logging visit:", error);
            alert("Failed to log vitals.");
        }
    };

    // logout function
    const loggingOut = async()=>{
        try {
            await fetch(`${API_BASE_URL}/logout`,{credentials: "include" })
            navigate("/")
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <>
        <h1 className="text-center mt-3">Healthly Health Care System</h1>
        <div className="text-end px-4">
          <button className="btn btn-outline-secondary" type="button" onClick={loggingOut}>Log out</button>
        </div>
        <div className="container py-4">
          <div className="p-5 mb-4 rounded-3" style={{ backgroundColor: '#e9ecef', color: '#333' }}>
            <div className="container-fluid py-4">
              <h1 className="display-5 fw-bold">Welcome to the Healthcare Management System</h1>
              <p className="col-md-12 fs-5">As our valued receptionist, you're the first point of care for every patient. Use this dashboard to register new clients, keep their records up to date, and ensure a seamless experience for everyone who walks through our doors.</p>
            </div>
          </div>
          <div className="row align-items-md-stretch">
            {/* add a client card */}
            <div className="col-md-6 mb-4">
              <div className="h-100 p-5 rounded-3" style={{ backgroundColor: '#495057', color: 'white' }}>
                <h2>Register a New Client</h2>
                <p>Begin a new client’s journey by capturing their basic details including full name, contact information, and identification number.</p>
                <button className="btn btn-light" type="button" onClick={handleCreateClient}>Add Client</button>
                {showModal && (
                  <div className={`modal-backdrop-custom show`}>
                    <div className="modal show fade d-block" tabIndex="-1" role="dialog">
                      <div className="modal-dialog modal-dialog-centered modal-dialog-custom show" role="document">
                        <div className="modal-content shadow-lg text-dark">
                          <div className="modal-header">
                            <h5 className="modal-title">Create New Client</h5>
                          </div>
                          <div className="modal-body">
                            <label className="form-label">Client Full Name</label>
                            <input type="text" name="name" className="form-control mb-3" value={newClient.name} onChange={handleChange} />
                            <label className="form-label">Phone Number</label>
                            <input type="text" name="phoneno" className="form-control mb-3" value={newClient.phoneno} onChange={handleChange} />
                            <label className="form-label">Identification Number</label>
                            <input type="text" name="idnum" className="form-control mb-3" value={newClient.idnum} onChange={handleChange} />
                          </div>
                          <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                            <button className="btn " style={{ backgroundColor: '#8DABCE', color: 'white' }} onClick={handleSaveClient}>Save Client</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* view clients card */}
            <div className="col-md-6 mb-4">
              <div className="h-100 p-5 border rounded-3" style={{ backgroundColor: '#f1f3f5', color: '#212529', borderColor: '#dee2e6' }}>
                <h2>View Registered Clients</h2>
                <p>Access a complete list of registered clients. You can search, view, and log new visits.</p>
                <button className="btn btn-outline-secondary" type="button" onClick={handleViewClients}>View Clients</button>

                {/* view clients modal */}
                {showViewModal && (
                  <div className="modal-backdrop-custom show">
                    <div className="modal show fade d-block" tabIndex="-1" role="dialog">
                      <div className="modal-dialog modal-dialog-scrollable modal-dialog-centered" style={{ maxWidth: "600px", height: "80vh" }} role="document">
                        <div className="modal-content shadow-lg">
                          <div className="modal-header">
                            <h5 className="modal-title">All Available Clients</h5>
                            <button type="button" className="btn-close" onClick={handleCloseViewModal}></button>
                          </div>
                          <div className="modal-body">
                            <input type="text" className="form-control mb-3" placeholder="Search clients..." value={searchQuery} onChange={handleSearch} />
                            {filteredClients.length > 0 ? (
                              <ul className="list-group">
                                {filteredClients.map((client) => (
                                  <li key={client.client_id} className="list-group-item d-flex justify-content-between align-items-center">
                                    {client.client_fullname}
                                    <button className="btn btn-sm" style={{ backgroundColor: '#8DABCE', color: 'white' }} onClick={() => handleOpenTriage(client)}>Log Vitals</button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>No clients found.</p>
                            )}
                          </div>
                          <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={handleCloseViewModal}>Close</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* log vitals modal */}
                {showTriageModal && selectedClient && (
                  <div className="modal-backdrop-custom show" style={{ zIndex: 1060 }}>
                    <div className="modal show fade d-block" tabIndex="-1" role="dialog">
                      <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content shadow-lg border-primary">
                          <div className="modal-header" style={{ backgroundColor: '#8DABCE', color: 'white' }} >
                            <h5 className="modal-title">Log Vitals: {selectedClient.client_fullname}</h5>
                          </div>
                          <div className="modal-body">
                            <div className="row">
                                <div className="col-6 mb-3">
                                    <label className="form-label">Age</label>
                                    <input type="number" name="age" className="form-control" value={visitData.age} onChange={handleVisitChange} required />
                                </div>
                                <div className="col-6 mb-3">
                                    <label className="form-label">Pain Level (1-10)</label>
                                    <input type="number" name="pain_level" min="1" max="10" className="form-control" value={visitData.pain_level} onChange={handleVisitChange} required />
                                </div>
                                <div className="col-6 mb-3">
                                    <label className="form-label">Temp (°C)</label>
                                    <input type="number" step="0.1" name="temperature" className="form-control" value={visitData.temperature} onChange={handleVisitChange} />
                                </div>
                                <div className="col-6 mb-3">
                                    <label className="form-label">Heart Rate (bpm)</label>
                                    <input type="number" name="heart_rate" className="form-control" value={visitData.heart_rate} onChange={handleVisitChange} />
                                </div>
                                <div className="col-6 mb-3">
                                    <label className="form-label">BP Systolic</label>
                                    <input type="number" name="blood_pressure_sys" placeholder="e.g. 120" className="form-control" value={visitData.blood_pressure_sys} onChange={handleVisitChange} />
                                </div>
                                <div className="col-6 mb-3">
                                    <label className="form-label">BP Diastolic</label>
                                    <input type="number" name="blood_pressure_dia" placeholder="e.g. 80" className="form-control" value={visitData.blood_pressure_dia} onChange={handleVisitChange} />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Chief Complaint (Symptoms)</label>
                                <textarea name="chief_complaint" rows="3" className="form-control" value={visitData.chief_complaint} onChange={handleVisitChange}></textarea>
                            </div>
                          </div>
                          <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={handleCloseTriage}>Cancel</button>
                            <button className="btn " style={{ backgroundColor: '#8DABCE', color: 'white' }} onClick={handleSaveVisit}>Save</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </>
       );
}

export default Receptionisthp;