import { useState } from "react";
import { useNavigate } from "react-router-dom"
const Login = () => {
    const [formData, setFormData] = useState({
        email:"",
        loginpassword:""
    })
    const navigate = useNavigate()//initialize navigation
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
            console.log("Role (email) updated to:", value);
        }
    }
    const [role, setRole] = useState("")
    const handleSubmit = async (event)=>{
        event.preventDefault(); //prevents page refresh
        // console.log("The data in the form is=>",formData)
        try {
            const response = await fetch("http://localhost:8000/",
                {
                method: "POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({ ...formData, role }),
                credentials: "include"
            })
                const data = await response.json()
                console.log("response from server=>", data)
                //navigate to homepage
                if(response.ok){
                    // alert ("login successfull")
                    if (role === "doctor@gmail.com") {
                        navigate("/dhome");
                    } else {
                        console.log("THE ROLEEE", role)
                        navigate("/rhome");
                    }
                }else{
                    alert(data.message)
                }
        } catch (error) {
            console.error("Error:", error);
        }
    }
    const handleSignup = ()=>{
        navigate("/signup")
    }
    return ( <>
    <h1 style={{ textAlign: 'center', marginTop: '30px' }}>Healthly Health Care System💉</h1>
    <div style={{ maxWidth: '400px',margin: '30px auto',padding: '30px',boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',borderRadius: '10px',backgroundColor: '#f9f9f9'}}>
    <form onSubmit={handleSubmit}>
        <div class="mb-3">
            <label htmlFor="exampleInputEmail1" class="form-label">Email address</label>
            <input type="email" name="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" value={formData.email} onChange={handleChange}/>
        </div>
        <div class="mb-3">
            <label htmlFor="exampleInputPassword1" class="form-label">Password</label>
            <input type="password" name="loginpassword" class="form-control" id="exampleInputPassword1" value={formData.loginpassword} onChange={handleChange}/>
        </div>
        <button type="submit" class="btn btn-primary" style={{ backgroundColor: '#8DABCE', color: 'white', width: '100%' }}>Login</button>
    </form>
    <p style={{ marginTop: '15px', textAlign: 'center' }}>Dont have an account?<a href="#" onClick={handleSignup}> Signup</a> instead</p>
    </div>
    </>
    );
}

export default Login;