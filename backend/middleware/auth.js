/**
 * Authentication & Authorization Middleware for Atelier Administration
 */
export const requireAdmin = (req, res, next) => {
  const configuredKey = process.env.ADMIN_API_KEY || 'vibe-atelier-admin-key-2026';
  
  // Accept key from header 'x-admin-key' or Authorization 'Bearer <key>'
  const headerKey = req.headers['x-admin-key'];
  const authHeader = req.headers['authorization'];
  let bearerKey = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    bearerKey = authHeader.slice(7).trim();
  }

  const providedKey = headerKey || bearerKey;

  if (!providedKey || providedKey !== configuredKey) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Valid Atelier admin credentials required.'
    });
  }

  next();
};
