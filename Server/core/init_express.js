//@ts-check
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT_DIR = __dirname + "/..";

const session = require("cookie-session");
const express = require("express");
const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || "127.0.0.1";

app.use(express.json());

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        // Handle JSON parsing errors
        res.status(400).send({
            error: 'Invalid JSON',
            message: 'The request body contains invalid JSON.'
        });
    } else {
        // Handle other errors
        next(err);
    }
});

app.use(
  session({
    secret: process.env.SECRET_KEY, // Şifreleme anahtarı
    // maxAge: 1000 * 60 * 60 * 24 * 3  // miliseconds // 3 days
  })
);

app.all("/", (req, res) => {
  res.send({
    error: false,
    message: "WELCOME TO BLOG API",
  });
});

async function loadServices(dir) {
  const files = await fs.promises.readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      // Recursively load services from subdirectories
      await loadServices(filePath);
    } else if (file.endsWith(".bsvc")) {
      // Load service module

      try {
        const data = fs.readFileSync(filePath, { encoding: "utf8" });
        const jsonData = JSON.parse(data);
        console.log("Parsed JSON data:", jsonData);

        if (!jsonData.active) continue;

        const Service = require(path.join(dir, "service.js"));
        const ServiceRouter = Service.GetRouter();

        app.use(jsonData.routerpath, ServiceRouter);
      } catch (parseErr) {
        console.error("Error parsing JSON:", parseErr);
      }
    }
  }
}
loadServices(ROOT_DIR);
app.listen(PORT, () =>
  console.log(`Server is running on http://${HOST}:${PORT}`)
);
