import { useState, useEffect } from "react"
const Clients = () => {
    const [clients, setClients] = useState([])
    const [selectedProgram, setSelectedProgram] = useState("")
    const [programs, setPrograms] = useState([])
    const [editingClientId, setEditingClientId] = useState(null);
    // fetch clients
    const fetchClients = async()=>{
        try {
            const response = await fetch("http://localhost:8000/clients")
            const data = await response.json()
            setClients(data)
        } catch (error) {
            console.error("Failed to fetch clients:", error);
        }
    }

    // fetch programs
    const fetchPrograms = async () => {
        try {
          const res = await fetch("http://localhost:8000/programs")
          const data = await res.json()
          setPrograms(data)
        } catch (error) {
          console.error("Failed to fetch programs:", error)
        }
    }

    //editing for each client
    const handleEdit = (clientId) => {
        setEditingClientId(clientId);
        setSelectedProgram("");
    };
    // save clients programs
    const handleSaveProgram = async (clientId) => {
        try {
          await fetch(`http://localhost:8000/assign-prog`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
                client_id: clientId,
                program_id: selectedProgram
            })
          });
          setEditingClientId(null)
          fetchClients(); //to get updated program list of client
        } catch (error) {
          console.error("Failed to assign program:", error);
        }
    }

    const handleSelectProg = (e)=>{
        setSelectedProgram(e.target.value)
    }

    useEffect(() => {
        fetchClients();
        fetchPrograms();
      }, []);
      console.log("Clients with programs:", clients);

    return (
    <>
    <h1 className="text-center mt-3">Client's homepage</h1>
    <div className="container">
    <div className="row">
    {clients.map((client) => (
            <div className="col-md-4 mb-4" key={client.client_id}>
              <div className="p-4 rounded shadow-sm" style={{backgroundColor: "#f1f3f5", border: "1px solid #dee2e6",minHeight: "250px"}}>
              <h5 style={{ color: "#495057" }}>{client.client_fullname}</h5>
                <p className="mb-1">📞 {client.phone_no}</p>
                <p className="mb-1">🆔 {client.identification_no}</p>
                <div className="mb-2">
                  <strong>Programs:</strong>
                  <ul className="ps-3">
                    {client.programs && client.programs.length > 0 ? (
                      client.programs.map((prog, index) => (
                        <li key={index} style={{ color: "#8DABCE" }}>{prog}</li>
                      ))
                    ) : (
                      <li className="text-muted">None</li>
                    )}
                  </ul>
                </div>
                {editingClientId === client.client_id ? (
                    <>
                    <select className="form-select mb-2" value={selectedProgram} onChange={handleSelectProg}>
                      <option value=""> Select Program </option>
                      {programs.map((prog) => (
                        <option key={prog.program_id} value={prog.program_id}>{prog.program_name}</option>
                      ))}
                    </select>
                    <button className="btn btn-primary btn-sm me-2" onClick={() => handleSaveProgram(client.client_id)}>Save</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingClientId(null)}>Cancel</button>
                  </>
                ) : (
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => handleEdit(client.client_id)}>Edit</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
    );
}

export default Clients;