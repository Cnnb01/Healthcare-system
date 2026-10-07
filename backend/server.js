import express from "express";
import cors from "cors";
import pg from "pg";
import env from "dotenv";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser"; //store the JWT in a cookie instead of sending it in the authorization header
import bcrypt from "bcrypt";

env.config()
const app = express()
const port = 8000
const saltRounds = 10
const db = new pg.Client({
    // user: process.env.DATABASE_USER,
    // host: process.env.DATABASE_HOST,
    // database: process.env.DATABASE_NAME,
    // password: process.env.DATABASE_PASSWORD,
    // port: process.env.DATABASE_PORT
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
db.connect();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true })); //CORS allows the frontend to make API requests to the backend.
app.use(express.json())
app.use(cookieParser());

//key used to sign JWTs
const SECRET_KEY = process.env.JWT_SECRET

app.post('/signup', async(req,res)=>{
    const {name,email,password} = req.body
    try {
        const confirmUser = await db.query("SELECT * FROM Users WHERE email=$1", [email])
        if(confirmUser.rows.length > 0){
            res.send({ message:"User already exists, try logging in instead"})
        }
        else{
            //password hashing
            bcrypt.hash(password, saltRounds, async (err, hash)=>{
                if(err){
                    console.log("Error hashing password", err)
                }else{
                    const result = await db.query("INSERT INTO Users (user_fullname, email, password) VALUES ($1, $2, $3)",[name, email, hash])
                    res.json({ message: "User registered successfully" });
                }
            })
        }
    } catch (error) {
        console.log("ERROR=>",error)
    }
})

app.post("/", async(req,res)=>{
    const {email,loginpassword} = req.body
    try {
        const confirmUser = await db.query("SELECT * FROM Users WHERE email=$1", [email])
        if(confirmUser.rows.length > 0){
            const theUser = confirmUser.rows[0]
            const storedpswd_hashed = theUser.password
            //comparing to hashed pswd
            bcrypt.compare(loginpassword, storedpswd_hashed, (err,result)=>{
                if(err){
                    console.log("Error comparing passwords =>", err)
                }else{
                    if (result){
                        // generate jwt
                        //step1:create a token
                        // console.log("the email is =>", email)
                        const token = jwt.sign({email:email},SECRET_KEY,{ expiresIn: "1h" })
                        // console.log("Generated Token =>", token);
                        const decoded = jwt.decode(token);
                        // console.log("Decoded JWT =>", decoded);
                        //step2:convert the token into a cookie
                        const cookiecreated = res.cookie("token", token, {
                            httpOnly: true,
                            secure: false,
                            maxAge: 3600000
                        })
                        // console.log("COOKIE CREATED=>",cookiecreated)
                        res.json({ success: true, message: "Login successful", token });
                    } else {
                        // console.log("Invalid credentials for email:", email);
                        res.status(401).json({ success: false, message: "Invalid credentials" });   
                    }
                }
            })
        } else{
            res.status(401).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        console.log(error)
    }
})

//step3:create middleware to carryout verification
const verifyAdmin = (req,res,next)=>{
    const token = req.cookies.token;
    // const newdecoded = jwt.decode(token);
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            // console.log("JWT Verification Error:", err.message);
            return res.status(403).json({ message: "Invalid token"});
        }
        // console.log("Decoded JWtT:", req.user.email );
        req.user = decoded
        next();
    });
};

app.get("/verify", verifyAdmin, (req, res) => {
    res.json({ role: req.user.email })
});

// clients
// fetch clients
app.get("/clients", async(req, res)=>{
    try {
        const result = await db.query(`
            SELECT c.client_id, c.client_fullname, c.phone_no, c.identification_no,
                   (SELECT visit_id FROM Visits v WHERE v.client_id = c.client_id ORDER BY visit_id DESC LIMIT 1) as visit_id,
                   (SELECT status FROM Visits v WHERE v.client_id = c.client_id ORDER BY visit_id DESC LIMIT 1) as status,
                   (SELECT triage_priority FROM Visits v WHERE v.client_id = c.client_id ORDER BY visit_id DESC LIMIT 1) as triage_priority,
                   (SELECT chief_complaint FROM Visits v WHERE v.client_id = c.client_id ORDER BY visit_id DESC LIMIT 1) as symptoms
            FROM Clients c
            -- Order so 'Pending' visits show up first, sorted by AI priority (0 = Critical)
            ORDER BY 
                (SELECT status FROM Visits v WHERE v.client_id = c.client_id ORDER BY visit_id DESC LIMIT 1) DESC,
                (SELECT triage_priority FROM Visits v WHERE v.client_id = c.client_id ORDER BY visit_id DESC LIMIT 1) ASC NULLS LAST;
          `)
        if(result.rows.length < 0){
            res.json({ message: "No clients found"});
        } else {
            res.json(result.rows);
        }
    } catch (error) {
        console.log("ERROR=>",error)
    }
})

//fetch a client
app.get("/clients/:id", async (req, res) => {
    const clientId = req.params.id;
    try {
        const result = await db.query(`
            SELECT client_id, client_fullname, phone_no, identification_no
            FROM Clients 
            WHERE client_id = $1
        `, [clientId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Client not found" });
        }else{
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error("ERROR =>", error);
    }
});

// add a client
app.post("/client", async(req, res)=>{
    const {name,phoneno,idnum} = req.body
    try {
        const result = await db.query("INSERT INTO Clients (client_fullname,phone_no, identification_no) VALUES ($1,$2,$3)",[name,phoneno,idnum])
        res.json(result.rows);
    } catch (error) {
        console.log("ERROR=>",error)
    }
})


app.get("/visit", async (req, res) => {
    try{
        const result = await db.query("SELECT * FROM Visits");
        res.json(result.rows);
    }catch(error){
        console.error("Error fetching visits", error);
        res.status(500).json({ message: "Error fetching visits" });
    }
})

// adding visits
app.post("/visit", async (req, res) => {
    const {client_id, age, pain_level, temperature, heart_rate, blood_pressure_sys, blood_pressure_dia, chief_complaint} = req.body;
    try {
        // step 1: Ask the AI Microservice for the Priority Score ---
        // (We use native fetch in Node.js to talk to our Python server)
        const aiResponse = await fetch(`${process.env.AI_SERVICE_URL}/api/v1/predict-triage`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // Ensure the data types match what Python Pydantic expects
                age: parseInt(age),
                pain_level: parseInt(pain_level),
                temperature: parseFloat(temperature),
                heart_rate: parseInt(heart_rate),
                blood_pressure_sys: parseInt(blood_pressure_sys),
                blood_pressure_dia: parseInt(blood_pressure_dia),
                chief_complaint: chief_complaint
            })
        });
        if(!aiResponse.ok){
            throw new Error(`AI Microservice responded with status ${aiResponse.status}`);
        }
        const aiData = await aiResponse.json();
        const calculated_priority = aiData.triage_priority;
        console.log(`AI predicted priority ${calculated_priority} for client ${client_id}`);
        // --- step 2: Save everything to PostgreSQL ---
        // Notice we added triage_priority to the INSERT statement!
        const result = await db.query("INSERT INTO Visits (client_id, age, pain_level, temperature, heart_rate, blood_pressure_sys, blood_pressure_dia, chief_complaint, triage_priority) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)", [client_id, age, pain_level, temperature, heart_rate, blood_pressure_sys, blood_pressure_dia, chief_complaint, calculated_priority]);
        res.status(201).json({ message: "Visit saved successfully",visit: result.rows[0] });
    } catch (error) {
        console.error("Error saving visit", error);
        res.status(500).json({ message: "Error logging visit" });
    }
})

// assigning diagnosis and treatment
app.put("/visit/:visit_id/examine", async(req, res) => {
    const { visit_id } = req.params;
    const { doctor_diagnosis, treatment_plan } = req.body;
    try{
        const result = await db.query("UPDATE Visits SET doctor_diagnosis=$1, treatment_plan=$2, status='examined' WHERE visit_id=$3 RETURNING *", [doctor_diagnosis, treatment_plan, visit_id]);
        if(result.rows.length === 0){
            return res.status(404).json({ message: "Visit not found" });
        }
        res.status(200).json({ message: "Patient examined and given a treatment plan", visit: result.rows[0] });
    }catch(error){
        console.error("Error logging patient diagnosis =>", error);
        res.status(500).json({ message: "Error updating visit record" });
    }
})

//logout
app.get("/logout", (req,res)=>{
    res.clearCookie("token",{
        httpOnly:true,
        secure: false
    });
    res.json({message: "Logged out successfully"})
})

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
});
// export default app;
// module.exports = app;