import express from "express";
import cors from "cors";
import pg from "pg";
import env from "dotenv";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser"; //store the JWT in a cookie instead of sending it in the authorization header
import bcrypt from "bcrypt";

import pkg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
const { Pool } = pkg;

env.config()
const app = express()
const port = process.env.PORT || 8000
const saltRounds = 10
app.use(express.json())
app.use(cookieParser());
//key used to sign JWTs
const SECRET_KEY = process.env.JWT_SECRET
// const db = new pg.Client({
//     user:"postgres",
//     host:"localhost",
//     database:"CEMAHealthcare",
//     password:process.env.DATABASE_PASSWORD,
//     port: 5432
// });
// db.connect();

//new db connection for hostin
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
})
// Export the pool for use in other modules
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('Error executing query', err.stack);
        }
        console.log(result.rows);
    });
});

const corsOptions = {
    origin: ["http://localhost:5173", "https://healthcare-system-nu.vercel.app/"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
};
app.options("*", cors(corsOptions));
app.use((req, res, next) => {
    // console.log("Request Method:", req.method);
    //console.log("Request Headers:", req.headers);
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Origin", req.headers.origin);
      res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.header("Access-Control-Allow-Credentials", "true");
      return res.sendStatus(200);
    }
    next();
});

// app.use(cors({ origin: "http://localhost:5173", credentials: true })); //CORS allows the frontend to make API requests to the backend.


app.post('/signup', async(req,res)=>{
    const {name,email,password} = req.body
    try {
        const confirmUser = await pool.query("SELECT * FROM Users WHERE email=$1", [email])
        if(confirmUser.rows.length > 0){
            res.send({ message:"User already exists, try loging in instead"})
        }
        else{
            //password hashing
            bcrypt.hash(password, saltRounds, async (err, hash)=>{
                if(err){
                    console.log("Error hashing password", err)
                }else{
                    const result = await pool.query("INSERT INTO Users (user_fullname, email, password) VALUES ($1, $2, $3)",[name, email, hash])
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
        const confirmUser = await pool.query("SELECT * FROM Users WHERE email=$1", [email])
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
                            secure: process.env.NODE_ENV === 'production',
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
        // console.log("Decoded JWtT:", req.user.email );
        req.user = decoded
        next();
    });
};

app.get("/verify", verifyAdmin, (req, res) => {
    res.json({ role: req.user.email })
});

// programs
//fetch programs
app.get("/programs", async(req,res)=>{
    try {
        const result = await pool.query("SELECT * FROM Programs")
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
        const result = await pool.query("INSERT INTO Programs (program_name) VALUES ($1)",[newprogram])
        res.json({ message: "Program added successfully" });
    } catch (error) {
        console.log("ERROR=>",error)
    }
})

// clients
// fetch clients
app.get("/clients", async(req, res)=>{
    try {
        const result = await pool.query((`
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
//fetch a client
app.get("/clients/:id", async (req, res) => {
    const clientId = req.params.id;
    try {
        const result = await pool.query(`
            SELECT c.client_id, c.client_fullname, c.phone_no, c.identification_no,
                   COALESCE(array_agg(p.program_name) FILTER (WHERE p.program_name IS NOT NULL), '{}') AS programs
            FROM Clients c
            LEFT JOIN Client_Programs cp ON c.client_id = cp.client_id
            LEFT JOIN Programs p ON cp.program_id = p.program_id
            WHERE c.client_id = $1
            GROUP BY c.client_id
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
        const result = await pool.query("INSERT INTO Clients (client_fullname,phone_no, identification_no) VALUES ($1,$2,$3)",[name,phoneno,idnum])
        res.json(result.rows);
    } catch (error) {
        console.log("ERROR=>",error)
    }
})

// asigning client programs
app.post("/assign-prog", async(req, res)=>{
    const {client_id, program_id} = req.body;
    try {
        const response = await pool.query("INSERT INTO Client_Programs (client_id, program_id) VALUES ($1, $2)",[client_id, program_id])
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
        secure: true
    });
    res.json({message: "Logged out successfully"})
})

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
});