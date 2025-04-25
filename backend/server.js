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
    user:"postgres",
    host:"localhost",
    database:"CEMAHealthcare",
    password:process.env.DATABASE_PASSWORD,
    port: 5432
});
db.connect();

app.use(cors({ origin: "http://localhost:5173", credentials: true })); //CORS allows the frontend to make API requests to the backend.
app.use(express.json())
app.use(cookieParser());

//key used to sign JWTs
const SECRET_KEY = process.env.JWT_SECRET

app.post('/signup', async(req,res)=>{
    const {name,email,password} = req.body
    try {
        const confirmUser = await db.query("SELECT * FROM Users WHERE email=$1", [email])
        if(confirmUser.rows.length > 0){
            res.send({ message:"User already exists, try loging in instead"})
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
                        // console.log("SECRET_KEY in Login:", SECRET_KEY);
                        // console.log("Generated Token =>", token);
                        const decoded = jwt.decode(token);
                        console.log("Decoded JWT =>", decoded);
                        //step2:convert the token into a cookie
                        const cookiecreated = res.cookie("token", token, {
                            httpOnly: true,
                            secure: false,
                            maxAge: 3600000
                        })
                        // console.log("COOKIE CREATED=>", cookiecreated)
                        res.json({ success: true, message: "Login successful", token });
                    } else {
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
        // console.log("Decoded JWT:", decoded);
        req.user = decoded
        next();
    });
};

app.get("/admin", verifyAdmin, (req, res) => {
    if(req.user.email === "admin@gmail.com"){
        res.json({ message: "Welcome Admin! You have access to this page." });
    }else {
        res.status(403).json({ message: "Access denied" });
    }
});

// programs
//fetch programs
app.get("/programs", async(req,res)=>{
    try {
        const result = await db.query("SELECT * FROM Programs")
        if(result.rows.length < 0){
            res.json({ message: "No programs found"});
        } else {
            res.json(result.rows);
        }
    } catch (error) {
        console.log(error)
    }
})
//add a program
app.post("/program", async(req, res)=>{
    const {newprogram} = req.body
    try {
        const result = await db.query("INSERT INTO Programs (program_name) VALUES ($1)",[newprogram])
        res.json({ message: "Program added successfully" });
    } catch (error) {
        console.log("ERROR=>",error)
    }
})

// clients
// fetch clients
app.get("/clients", async(req, res)=>{
    try {
        const result = await db.query((`
            SELECT c.client_id, c.client_fullname, c.phone_no, c.identification_no,
                   COALESCE(array_agg(p.program_name) FILTER (WHERE p.program_name IS NOT NULL), '{}') AS programs
            FROM Clients c
            LEFT JOIN Client_Programs cp ON c.client_id = cp.client_id
            LEFT JOIN Programs p ON cp.program_id = p.program_id
            GROUP BY c.client_id
          `))
        if(result.rows.length < 0){
            res.json({ message: "No clients found"});
        } else {
            res.json(result.rows);
        }
    } catch (error) {
        console.log("ERROR=>",error)
    }
})
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

// asigning client programs
app.post("/assign-prog", async(req, res)=>{
    const {client_id, program_id} = req.body;
    try {
        const response = await db.query("INSERT INTO Client_Programs (client_id, program_id) VALUES ($1, $2)",[client_id, program_id])
        res.json({ message: "Program assigned" });
    } catch (error) {
        console.error("Assign failed", error);
    res.status(500).json({ message: "Error assigning program" });
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