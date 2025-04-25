import { useState } from "react";
import { useNavigate } from "react-router-dom"
const Signup = () => {
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
            const response = await fetch("http://localhost:8000/signup",{
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
    <form onSubmit={handleSubmit}>
        <div class="mb-3">
            <label htmlFor="exampleInputName" class="form-label">Full Name</label>
            <input type="name" name="name" class="form-control" id="exampleInputName" aria-describedby="nameHelp" value={formData.fullname} onChange={handleChange}/>
        </div>
        <div class="mb-3">
            <label htmlFor="exampleInputEmail1" class="form-label">Email address</label>
            <input type="email" name="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" value={formData.myemail} onChange={handleChange}/>
        </div>
        <div class="mb-3">
            <label htmlFor="exampleInputPassword1" class="form-label">Password</label>
            <input type="password" name="password" class="form-control" id="exampleInputPassword1" value={formData.mypswd} onChange={handleChange}/>
        </div>
        <button type="submit" class="btn btn-primary">Signup</button>
    </form>
    </>
    );
}

export default Signup;