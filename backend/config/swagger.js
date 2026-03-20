import swaggerJsDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Project Management API",
      version: "1.0.0",
      description: "Backend API for Projects and Tasks",
    },
    servers: [
      { 
        url: "http://localhost:5000",
      },
      {url: "https://project-management-api-8pxb.onrender.com", // Add your actual Render link here
        description: "Production server"},
    ],
  },
  apis: ["./routes/*.js"],
  components: {
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT"
    }
  }
},
security: [
    {
      bearerAuth: [],
    },]
};

const swaggerSpec = swaggerJsDoc(options);

export default swaggerSpec;