import { useState } from "react";
import { useNavigate } from "react-router-dom"
const Login = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const [formData, setFormData] = useState({
        email:"",
        loginpassword:""
    })
    const navigate = useNavigate()//initialize navigation
    const [role, setRole] = useState("")
    const handleChange = (event)=>{
        const {value, name} = event.target
        setFormData((prevValue)=>{
            return{
                ...prevValue,
                [name]:value
            }
        })
        if (name === "email") {
            setRole(value);
            // console.log("Role/email updated to:", value);
        }
    }
    const handleSubmit = async (event)=>{
        event.preventDefault(); //prevents page refresh
        // console.log("The data in the form is=>",formData)
        try {
            const response = await fetch(`${API_BASE_URL}/`,
                {
                method: "POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({ ...formData, role }),
                credentials: "include"
            })
                const data = await response.json()
                // console.log("response from server=>", data)
                //navigate to homepage
                if(response.ok){
                    if (role === "doctor@gmail.com") {
                        navigate("/dhome");
                    } else {
                        // console.log("THE ROLEEE", role)
                        navigate("/rhome");
                    }
                }else{
                    alert(data.message)
                    // console.log(`Login failed with status ${response.status}:`, data.message)
                }
        } catch (error) {
            console.error("Error:", error);
        }
    }
    // const handleSignup = ()=>{
    //     navigate("/signup")
    // }
    return ( <>
    <h1 className=".form-sizestyle">Healthly Health Care System</h1>
    <div className="formdiv">
    <form onSubmit={handleSubmit}>
        <div className="mb-3">
            <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
            <input type="email" name="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" value={formData.email} onChange={handleChange}/>
        </div>
        <div className="mb-3">
            <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
            <input type="password" name="loginpassword" className="form-control" id="exampleInputPassword1" value={formData.loginpassword} onChange={handleChange}/>
        </div>
        <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#8DABCE', color: 'white', width: '100%' }}>Login</button>
    </form>
    {/* <p style={{ marginTop: '15px', textAlign: 'center' }}>Dont have an account?<a href="#" onClick={handleSignup}> Signup</a> instead</p> */}
    </div>
    </>
    );
}

export default Login;