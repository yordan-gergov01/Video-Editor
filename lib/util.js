const fs = require("fs/promises");

const util = {};

// Delete a file if exists, if not the function will not throw an error
util.deleteFile = async (path) => {
  try {
    await fs.unlink(path);
  } catch (error) {
    console.log(error);
  }
};

// Delete a folder if exists, if not the function will not throw an error
util.deleteFolder = async (path) => {
  try {
    // if recursive: true the existing items in the folder will be deleted as well
    await fs.rm(path, { recursive: true });
  } catch (error) {
    console.log(error);
  }
};

module.exports = util;
