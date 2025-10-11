import { Router, type Request, type Response } from 'express';
import { AuthService } from '../services/authService.js';
import { OAuthCallbackSchema, type AuthResponse } from '@local/shared';

const router = Router();
const authService = new AuthService();

/**
 * GET /api/auth/google
 * Redirect to Google OAuth
 */
router.get('/google', (req: Request, res: Response) => {
  try {
    const authUrl = authService.getAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate authentication URL' 
    });
  }
});

/**
 * GET /api/auth/google/callback
 * Handle OAuth callback from Google
 */
router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    // Get code from query parameters (Google sends it as a GET request)
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Authorization code missing'
      });
    }
    
    // Authenticate user
    const user = await authService.authenticateUser(code);
    
    // Store user info in localStorage on the frontend and redirect
    // The frontend AuthContext will pick this up
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/google/callback?user=${encodeURIComponent(JSON.stringify(user))}`);
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    
    // Redirect to frontend with error message
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    res.redirect(`${frontendUrl}/auth/google/callback?error=${encodeURIComponent(errorMessage)}`);
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    // For now, we'll use a simple session-based approach
    // In the future, this could be enhanced with JWT tokens
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not authenticated' 
      });
    }
    
    const user = await authService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error getting user info:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get user info' 
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', (req: Request, res: Response) => {
  // For now, logout is handled on the frontend
  // In the future, this could invalidate JWT tokens
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
