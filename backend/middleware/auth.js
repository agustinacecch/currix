import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    console.log("HEADER AUTH:", req.headers.authorization);

    const token = req.headers.authorization?.split(" ")[1];

    console.log("TOKEN EXTRAIDO:", token);

    if (!token) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const decoded = jwt.verify(token, "secreto123");

    req.user = decoded;

    next();

  } catch (error) {
    console.log("ERROR TOKEN:", error.message);
    return res.status(401).json({ message: "Token inválido" });
  }
};

export default authMiddleware;