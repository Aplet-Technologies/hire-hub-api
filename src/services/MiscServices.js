import bcrypt from "bcrypt";

export const encryptPassword = (string) => {
  return bcrypt.hash(string, 10);
};

export const checkPassword = (password, existPassword) => {
  return bcrypt.compare(password, existPassword);
};
