import Footer from "./Footer";
import { useNavigate } from "react-router-dom"
const Doctorhp = () => {
    const navigate = useNavigate()
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const handleViewClients = () => {
        navigate("/clients")
    };
    const loggingOut = async()=>{
        try {
            const response = await fetch(`${API_BASE_URL}/logout`,{
                credentials: "include"
            })
            navigate("/")
        } catch (error) {
            console.error(error);
        }
    }
    return (
    <>
    <h1 className="text-center mt-3">Healthly Health Care System </h1>
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

    <div className="row align-items-md-stretch justify-content-center">
        <div className="col-md-8 mb-4">
            <div className="h-100 p-5 bg-light border rounded-3 text-center" style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                <h2 style={{color:"#4D4D4D"}}>Active Patient Queue</h2>
                <p style={{color:"#4D4D4D"}}>Review incoming patients, check their AI priority scores, and log your official diagnoses.</p>
                <button className="btn btn-primary btn-lg mt-3" style={{ backgroundColor: '#8DABCE', border: 'none' }} onClick={handleViewClients}>Open Triage Queue</button>
            </div>
        </div>
    </div>
    <Footer />
    </div>
    </> );
}

export default Doctorhp;