import express from "express";
import TestRoutes from "./app/routes/Test.routes.js";

const app = express();

app.use(express.json());

/* Routes */
app.use("/test", TestRoutes);

app.listen(8000, () => {
  console.log("Server is running on port 3000");
});