let regexOBJ = {
  // Username: Allows alphanumeric characters and underscores. Length must be between 4 and 20 characters.
  username: /^[a-zA-Z0-9_]{4,20}$/,

  // Password: Requires at least one digit and one letter. Total length must be at least 8 characters.
  password: /^(?=.*\d)(?=.*[a-zA-Z]).{8,}$/,

  // Email: Validates a basic email format. Requires '@' and a period ('.'). Allows any characters except whitespace.
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // Phone: Validates a basic phone number with 10 digits. Adjust for your specific phone number format.
  phone: /^\d{10}$/, // Example: 1234567890 (10 digits)
};

let regexMessages = {
  username: "Invalid username. It must be 4-20 characters long and can only contain letters, numbers, and underscores.",
  password: "Invalid password. It must be at least 8 characters long and include at least one letter and one number.",
  email: "Invalid email address. Please use a valid email format.",
  phone: "Invalid phone number. It must be a 10-digit number.",
};

const matchRegex = (values, keys) => {
  let errors = {};
  for (let index = 0; index < keys.length; index++) {
    const element = keys[index];
    let val = values[index];
    let regex = regexOBJ[element];
    if (regex) {
      if (!regex.test(val) || !val) {
        errors[element] = regexMessages[element];
      }
    } else {
      console.log("invalid regex key: " + element);
    }
  }

  if (Object.keys(errors).length) {
    return errors;
  }

  return false;
};

const checkValid = (values, keys) => {
  let errors = {};
  for (let index = 0; index < keys.length; index++) {
    const element = keys[index];
    let val = values[index];

    if (typeof element == "object") {
      if (element.type == "number" && isNaN(+val)) {
        errors[element.key] = `${element.key} Must be a number`;
      }

      if (!val || !String(val).trim().length) {
        errors[element.key] = `${element.key} is required`;
      }
    } else {
      if (!val || !String(val).trim().length) {
        errors[element] = `${element} is required`;
      }
    }
  }

  if (Object.keys(errors).length) {
    return errors;
  }

  return false;
};

module.exports = { matchRegex, checkValid };
