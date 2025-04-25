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
    }
    const handleSubmit = async (event)=>{
        event.preventDefault(); //prevents page refresh
        console.log("The data in the form is=>",formData)
        try {
            const response = await fetch("http://localhost:8000/",{
                method: "POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify(formData),
                credentials: "include"
            })
                const data = await response.json()
                console.log("response from server=>", data)
                //navigate to homepage
                if(response.ok){
                    alert ("login successfull")
                    navigate("/rhome")
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
<h1>Login page</h1>
    <form onSubmit={handleSubmit}>
        <div class="mb-3">
            <label htmlFor="exampleInputEmail1" class="form-label">Email address</label>
            <input type="email" name="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" value={formData.email} onChange={handleChange}/>
        </div>
        <div class="mb-3">
            <label htmlFor="exampleInputPassword1" class="form-label">Password</label>
            <input type="password" name="loginpassword" class="form-control" id="exampleInputPassword1" value={formData.loginpassword} onChange={handleChange}/>
        </div>
        <button type="submit" class="btn btn-primary">Login</button>
    </form>
    <p>Dont have an account?<a href="#" onClick={handleSignup}> Signup</a> instead</p>
    </>
    );
}

export default Login;