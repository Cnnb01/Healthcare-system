import { useState, useEffect } from "react"
import { Navigate } from "react-router-dom"
const ProtectedRoute = ({ children, requiredRole }) => {
    const [authenticated, setAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(()=>{
        const checkAuth = async ()=>{
            try {
                const response = await fetch("http://localhost:8000/verify",{
                    method: "GET",
                    credentials: "include"
            })
                const data = await response.json();

                // console.log("RESPONSEE.OK SAYSS=>",response.ok)
                console.log("DATA.MESSAGE SAYYS=>",data.message)

                if (response.ok && data.role === requiredRole) {
                    setAuthenticated(true);
                } else {
                    setAuthenticated(false);
                }
            } catch (error) {
                setAuthenticated(false)
            }finally{
                setLoading(false)
            }
        }
        checkAuth()
    }, [requiredRole])

    if (loading){
        return <h1>Loading...</h1>
    }
    return authenticated? children: <Navigate to="/rhome" />
}
export default ProtectedRoute;