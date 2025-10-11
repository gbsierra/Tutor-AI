import { type Request, type Response, type NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import { type AuthUser } from '@local/shared';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const authService = new AuthService();

/**
 * Authentication middleware that validates user ID from headers
 */
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get user ID from header
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required - missing user ID header' 
      });
    }

    // Validate user exists in database
    const user = await authService.getUserById(userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid user ID' 
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Authentication failed' 
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no user ID
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    if (userId) {
      const user = await authService.getUserById(userId);
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    // Don't fail the request, just continue without user
    next();
  }
};
