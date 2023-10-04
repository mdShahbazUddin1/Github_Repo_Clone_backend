const express =require("express");
const { connection } = require("./config/db");
const { githubRoute } = require("./router/github.routes");
require("dotenv").config()

const app = express();

app.use(express.json());

app.use("/user",githubRoute)


app.listen(process.env.PORT, async()=>{

    try {
        await connection
        console.log("DB is connected")
    } catch (error) {
        console.log(error)
    }

    console.log("server is running")
})