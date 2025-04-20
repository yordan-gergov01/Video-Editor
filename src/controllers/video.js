const path = require("path");
const crypto = require("crypto");
const fs = require("fs/promises");
const { pipeline } = require("stream/promises");

const util = require("../../lib/util");
const DB = require("../DB");

const getVideos = (req, res, handleErr) => {
  const name = req.params.get("name");

  if (name) {
    res.json({ message: `Your name is ${name}` });
  } else {
    return handleErr({ status: 400, message: "Please specify a name." });
  }
};

const uploadVideo = async (req, res, handleErr) => {
  const specifiedFileName = req.headers.filename;
  const extension = path.extname(specifiedFileName).substring(1).toLowerCase();
  const fileName = path.parse(specifiedFileName).name;
  const videoId = crypto.randomBytes(4).toString("hex");

  try {
    await fs.mkdir(`./storage/${videoId}`);

    // the original path
    const fullPath = `./storage/${videoId}/original.${extension}`;
    const fileHandle = await fs.open(fullPath, "w");
    const fileStream = fileHandle.createWriteStream();

    await pipeline(req, fileStream);

    // Make a tumbnail for the video file
    // Get the dimensions

    DB.update();
    DB.videos.unshift({
      id: DB.videos.length,
      videoId,
      name,
      extension,
      userId: req.userId,
      extractedAudio: false,
      resizes: {},
    });

    DB.save();

    res.status(200).json({
      status: "success",
      message: "The file was uploaded successfully!",
    });
  } catch (error) {
    // Delete the folder
    util.deleteFolder(`./storage/${videoId}`);
    if (error.code === "ECONNRESET") return handleErr(error);
  }
};

const controller = {
  getVideos,
  uploadVideo,
};

module.exports = controller;
