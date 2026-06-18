const deviceAuth = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.ESP32_API_KEY) {
    return res.status(401).json({ message: "Unauthorized device" });
  }
  next();
};

module.exports = deviceAuth;
