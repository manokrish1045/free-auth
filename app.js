const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const dbConnect = require("./db/dbConnect");
const bcrypt = require("bcrypt");
const User = require("./db/userModel");
const jwt = require("jsonwebtoken");
const auth = require("./auth");
const cors = require("cors")




dbConnect();
app.use(cors())

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});



// body parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, response, next) => {
  response.json({ message: "Hey! This is your server response!" });
  next();
});

// app.post("/register", (request, response) => {
//   // hash the password
//   bcrypt
//     .hash(request.body.password, 10)
//     .then((hashedPassword) => {
//       // create a new user instance and collect the data
//       const user = new User({
//         email: request.body.email,
//         password: hashedPassword,
//       });

//       // save the new user
//       user.save()
//         // return success if the new user is added to the database successfully
//         .then((result) => {
//           response.status(201).send({
//             message: "User Created Successfully",
//             result,
//           });
//         })
//         // catch error if the new user wasn't added successfully to the database
//         .catch((error) => {
//           console.log(error)
//           response.status(400).send({
//             message: "Error creating user",
//             error,

//           });
//         });
//     })
//     // catch error if the password hash isn't successful
//     .catch((e) => {
//       console.log(e)

//       response.status(500).send({
//         message: "Password was not hashed successfully",
//         e,
//       });
//     });
// });

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashedpassword = await bcrypt.hash(password, 10);
    user = new User({
      name,
      email,
      password: hashedpassword,
    });
    await user.save();
    return res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    // console.log(err);
    return res.status(400).json({ error: err.message });
  }
});


app.post("/login", (request, response) => {
  // check if email exists
  User.findOne({ email: request.body.email })

    // if email exists
    .then((user) => {
      // compare the password entered and the hashed password found
      bcrypt
        .compare(request.body.password, user.password)

        // if the passwords match
        .then((passwordCheck) => {

          // check if password matches
          if (!passwordCheck) {
            return response.status(400).send({
              message: "Passwords does not match",
              error,
            });
          }

          //   create JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          //   return success response
          response.status(200).send({
            message: "Login Successful",
            email: user.email,
            token,
          });
        })
        // catch error if password does not match
        .catch((error) => {
          response.status(400).send({
            message: "Passwords does not match",
            error,
          });
        });
    })
    // catch error if email does not exist
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        e,
      });
    });
});


app.get("/free-endpoint", (request, response) => {
  response.json({ message: "You are free to access me anytime" });
});

// authentication endpoint
app.get("/auth-endpoint", (request, response) => {
  response.json({ message: "You are not authorized to access me" });
});




module.exports = app;
