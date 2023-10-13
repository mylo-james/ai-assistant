let userData;
const fs = require("fs").promises;

const loadUserData = async () => {
  userData = fs.readFile("userData/aboutMe.txt", "utf8");
};

module.exports = { userData, loadUserData };
