import { useState } from "react";
import { useNavigate } from "react-router-dom"
const Signup = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const [formData, setFormData] = useState({
        name:"",
        email:"",
        password:""
    })
    const navigate = useNavigate()
    const handleChange = (event)=>{
        const {value, name} = event.target
        setFormData((prevValue)=>{
            return{
                ...prevValue,
                [name]:value
            }
        })
    }
    //for form submition
    const handleSubmit = async(event)=>{
        event.preventDefault(); //prevents page refresh
        console.log("The data in the form is=>",formData)
        try {
            const response = await fetch(`${API_BASE_URL}/signup`,{
                method: "POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify(formData)
            })
            const data = await response.json()
            console.log("response fro server=>", data)
            //navigate to homepage
            if(response.ok){
                alert ("user created successfully")
                navigate("/rhome")
            }else{
                alert(data.message)
            }
        } catch (error) {
            console.error("Error:", error);
        }

    }
    return (
    <>
    <h1 className="form-sizestyle">Healthly Health Care System</h1>
    <div className="formdiv">
    <form onSubmit={handleSubmit}>
        <div className="mb-3">
            <label htmlFor="exampleInputName" className="form-label">Full Name</label>
            <input type="name" name="name" className="form-control" id="exampleInputName" aria-describedby="nameHelp" value={formData.name} onChange={handleChange}/>
        </div>
        <div className="mb-3">
            <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
            <input type="email" name="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" value={formData.email} onChange={handleChange}/>
        </div>
        <div className="mb-3">
            <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
            <input type="password" name="password" className="form-control" id="exampleInputPassword1" value={formData.password} onChange={handleChange}/>
        </div>
        <button type="submit" className="btn btn-primary">Signup</button>
    </form>
    </div>
    </>
    );
}

export default Signup;