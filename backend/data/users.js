import bcrypt from "bcryptjs";

const users = [
  {
    name: "Steve Anderson",
    email: "stevea@sevenboughs.com",
    password: bcrypt.hashSync("123456", 10),
    isAdmin: true,
  },
  {
    name: "Joe Anderson",
    email: "joseph.anderson423@gmail.com",
    password: bcrypt.hashSync("123456", 10),
    isAdmin: true,
  },
];

export default users;
