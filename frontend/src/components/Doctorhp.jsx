import Footer from "./Footer";
import { useState } from "react";
import { useNavigate } from "react-router-dom"
const Doctorhp = () => {
    const navigate = useNavigate()
    const API_BASE_URL = "http://localhost:8000"
    //create new program
    const [newProgram, setNewProgram] = useState("")
    const handleChange = (e)=>{
        setNewProgram(e.target.value)
    }

    const [showModal, setShowModal] = useState(false);
    const handleCreateProgram = ()=> {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setNewProgram("");
    };

    const handleSaveProgram = async() => {
        console.log("Program to save:", newProgram);
        try {
            const response = await fetch("http://localhost:8000/program",{
                method:"POST",
                headers:{
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    newprogram: newProgram
                })
            })
            if(!response.ok){
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error adding program:", error)
        }
        handleCloseModal();
    };

    //view programs
    const [showViewModal, setShowViewModal] = useState(false);
    const [programList, setProgramList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const handleViewPrograms = async () => {
        try {
          const response = await fetch("http://localhost:8000/programs");
          const data = await response.json();
          setProgramList(data);
          setShowViewModal(true);
        } catch (error) {
          console.error("Failed to fetch programs:", error);
        }
      };

    const handleCloseViewModal = () => {
        setShowViewModal(false);
        setSearchQuery("");
    };
    const handleSearch = (e)=>{
        setSearchQuery(e.target.value)
    }
    const filteredPrograms = programList.filter((program) =>
        program.program_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleViewClients = () => {
        navigate("/clients")
    };
    const loggingOut = async()=>{
        try {
            const response = await fetch("http://localhost:8000/logout",{
                credentials: "include"
            })
            const data = await response.json();
            navigate("/")
        } catch (error) {
            console.error(error);
        }
    }
    return (
    <>
    <h1 className="text-center mt-3">Healthly Health Care System 💉</h1>
    <div className="text-end px-4">
        <button className="btn btn-outline-secondary" type="button" onClick={loggingOut}>Log out</button>
    </div>
    <div className="container py-4">
    <div className="p-5 mb-4 rounded-3" style={{ backgroundColor: '#8DABCE', color: '#dee2e6', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)' }}>
        <div className="container-fluid py-5">
            <h1 className="display-5 fw-bold">Welcome, Doctor</h1>
            <p className="col-md-12 fs-4">
              This dashboard gives you access to all registered clients and health programs. 
              You can create, view, and manage programs while keeping track of your clients’ enrollments and progress.
            </p>
        </div>
    </div>

    <div className="row align-items-md-stretch">
        <div className="col-md-6 mb-4">
            <div className="h-100 p-5 rounded-3" style={{ backgroundColor: '#3a3d42', color: 'white', boxShadow: '0 3px 8px rgba(0,0,0,0.2)' }}>
              <h2 style={{color:"#dee2e6"}}>Health Programs</h2>
              <p style={{color:"#dee2e6"}}>Manage various health programs like TB, HIV, or Malaria. Create new ones or view and update existing programs to ensure clients are receiving the care they need.</p>
              <button className="btn btn-outline-light me-2" onClick={handleCreateProgram}>Create Program</button>
              {/* modal triggered to create a program */}
                {showModal && (
                    <div className={`modal-backdrop-custom show`}>
                        <div className="modal show fade d-block" tabIndex="-1" role="dialog">
                        <div className={`modal-dialog modal-dialog-centered modal-dialog-custom show`} role="document">
                            <div className="modal-content shadow-lg">
                            <div className="modal-header">
                                <h5 className="modal-title">Create New Program</h5>
                            </div>
                            <div className="modal-body">
                                <label htmlFor="programInput" className="form-label">Enter New Program Name</label>
                                <input type="text" name="newprogram" className="form-control" id="programInput" value={newProgram} onChange={handleChange}/>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                                <button className="btn btn-secondary"  style={{ backgroundColor: '#8DABCE', color: 'white' }}  onClick={handleSaveProgram}>Save Program</button>
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                )}

              <button className="btn btn-outline-light" onClick={handleViewPrograms}>View Programs</button>
              {/* modal triggered to display list of programs */}
              {showViewModal && (
                <div className="modal-backdrop-custom show">
                <div className="modal show fade d-block" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-dialog-scrollable modal-dialog-centered" style={{ maxWidth: "600px", height: "80vh" }} role="document">
                    <div className="modal-content shadow-lg">
                    <div className="modal-header">
                        <h5 className="modal-title">All Health Programs</h5>
                        <button type="button" className="btn-close" onClick={handleCloseViewModal}></button>
                    </div>
                    <div className="modal-body">
                        <input type="text" className="form-control mb-3" placeholder="Search programs..." value={searchQuery} onChange={handleSearch}/>
                        {filteredPrograms.length > 0 ? (
                        <ul className="list-group">
                            {filteredPrograms.map((program, index) => (
                            <li key={index} className="list-group-item">{program.program_name}</li>
                            ))}
                        </ul>
                        ) : (
                        <p>No programs found.</p>
                        )}
                    </div>
                    </div>
                </div>
                </div>
                </div>
                )}

            </div>
        </div>
        <div className="col-md-6 mb-4">
            <div className="h-100 p-5 bg-light border rounded-3" style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
              <h2 style={{color:"#4D4D4D"}}>Clients Overview</h2>
              <p style={{color:"#4D4D4D"}}>Review all clients in the system. See their profile details, enrollment status, and update their program associations as needed.</p>
              <button className="btn btn-outline-secondary" style={{ borderColor: '#8DABCE', color: '#8DABCE' }} onClick={handleViewClients}>View Clients</button>
            </div>
        </div>
    </div>
    <Footer />
    </div>
    </> );
}

export default Doctorhp;