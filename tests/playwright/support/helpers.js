const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:4000";

function randomSuffix() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function randomName() {
  return `User_${randomSuffix()}`;
}

function randomEmail() {
  return `user_${randomSuffix()}@teste.com`;
}

function buildRandomUser() {
  return {
    name: randomName(),
    email: randomEmail(),
    password: process.env.PW_REGISTER_PASSWORD || "senha123",
  };
}

module.exports = {
  API_BASE_URL,
  randomName,
  randomEmail,
  buildRandomUser,
};
