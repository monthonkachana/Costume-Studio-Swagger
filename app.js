require("dotenv").config();
const PORT = process.env.PORT || 8080;
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI;
//read file yaml
const fs = require("fs");
const YAML = require("yaml");
const glob = require("glob");

//import routes
const costumeRoutes = require("./routes/costume");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const app = express();

// Swagger set up
const swagger_options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Costume Studio Rentals API JS",
      version: "3.0.0",
      description: "A simple app to view and rent costumes.",
    },
    servers: [

      {
        url: "http://localhost:8080",
        description: "Development server",
      },
    ],
  },
  apis: ["./swagger/SwaggerJS/*.js"],
  //apis: ['./swagger/*{js,yaml}']
};
const swagger_optionstwo = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Costume Studio Rentals API YAML",
      version: "3.0.0",
      description: "A simple app to view and rent costumes.",
    },
    servers: [

      {
        url: "http://localhost:8080",
        description: "Development server",
      },
    ],
  },
  apis: ["./swagger/SwaggerYAML/*.yaml"],
};

const specs = swaggerJsDoc(swagger_options);
const specstwo = swaggerJsDoc(swagger_optionstwo);

//view api contract at localhost:8080/api-docs-one
app.use(
  "/api-docs-one", 
  swaggerUI.serveFiles(specs), 
  swaggerUI.setup(specs));

//view api contract at localhost:8080/api-docs-two
app.use(
  "/api-docs-two",
  swaggerUI.serveFiles(specstwo),
  swaggerUI.setup(specstwo)
);

app.use(
  "/api-docs-dynamic",
  function (req, res, next) {
    req.swaggerDoc = swaggerDocument;
    next();
  },
  swaggerUI.serveFiles(),
  swaggerUI.setup()
);

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(costumeRoutes);
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

// const corsOptions = {
//   origin: `https://${process.env.HEROKU_APP}`,
//   optionsSuccessStatus: 200,
// };
// app.use(cors(corsOptions));

const options = {
  // useUnifiedTopology: true,
  // useNewUrlParser: true,
  family: 4,
};

const MONGODB_URL = process.env.MONGODB_URL || MONGODB_URI;

// MongoDB connection
mongoose
  .connect(MONGODB_URL, options)
  .then((result) => {
    const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));
    const io = require("./socket").init(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST", "DELETE", "PUT"],
      },
    });
    io.on("connection", (socket) => {
      console.log("Client connected");
    });
  })
  .catch((err) => console.log(err));
