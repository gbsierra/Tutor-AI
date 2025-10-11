import { OAuth2Client } from 'google-auth-library';
import { db } from './database.js';
import { 
  GoogleUser, 
  AuthUser, 
  validateGmailEmail, 
  GoogleUserSchema,
  AuthUserSchema 
} from '@local/shared';

export class AuthService {
  private client: OAuth2Client;
  
  constructor() {
    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }
  
  /**
   * Get Google OAuth authorization URL
   */
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'openid'
    ];
    
    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }
  
  /**
   * Exchange authorization code for user info
   */
  async authenticateUser(code: string): Promise<AuthUser> {
    try {
      // Exchange code for tokens
      const { tokens } = await this.client.getToken(code);
      this.client.setCredentials(tokens);
      
      // Get user info from Google
      const ticket = await this.client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      
      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid token payload');
      }
      
      // Debug: Log what Google is returning (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('Google OAuth payload:', {
          sub: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          email_verified: payload.email_verified
        });
      }

      // Validate and parse Google user data
      const googleUser: GoogleUser = GoogleUserSchema.parse({
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        verified_email: payload.email_verified
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Parsed Google user:', googleUser);
      }
      
      // Validate Gmail email domain
      if (!validateGmailEmail(googleUser.email)) {
        throw new Error('Please use a Gmail account (@gmail.com or @googlemail.com)');
      }
      
      // Create or get user from database
      const user = await this.createOrGetUser(googleUser);
      
      return user;
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Provide more specific error messages for debugging
      if (error instanceof Error) {
        if (error.message.includes('invalid_grant')) {
          throw new Error('Authorization code expired or invalid. Please try again.');
        } else if (error.message.includes('access_denied')) {
          throw new Error('Access denied by user. Please try again and grant permissions.');
        } else if (error.message.includes('Please use a Gmail account')) {
          throw error; // Re-throw Gmail validation error as-is
        } else {
          throw new Error(`Authentication failed: ${error.message}`);
        }
      } else {
        throw new Error('Authentication failed: Unknown error');
      }
    }
  }
  
  /**
   * Create or get user from database
   */
  private async createOrGetUser(googleUser: GoogleUser): Promise<AuthUser> {
    try {
      // Check if user exists
      const existingUser = await db.query(
        'SELECT * FROM users WHERE google_id = $1 OR email = $2',
        [googleUser.id, googleUser.email]
      );
      
      if (existingUser.length > 0) {
        // Update existing user
        const updatedUser = await db.query(`
          UPDATE users 
          SET 
            google_id = $1,
            name = $2,
            avatar_url = $3,
            updated_at = NOW()
          WHERE id = $4
          RETURNING *
        `, [
          googleUser.id,
          googleUser.name,
          googleUser.picture,
          existingUser[0].id
        ]);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Updated user from database:', updatedUser[0]);
        }
        return this.mapDbUserToAuthUser(updatedUser[0]);
      } else {
        // Create new user
        const newUser = await db.query(`
          INSERT INTO users (google_id, email, name, avatar_url)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [
          googleUser.id,
          googleUser.email,
          googleUser.name,
          googleUser.picture
        ]);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('New user created in database:', newUser[0]);
        }
        return this.mapDbUserToAuthUser(newUser[0]);
      }
    } catch (error) {
      console.error('Database error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          throw new Error('User already exists with this email or Google ID');
        } else if (error.message.includes('connection')) {
          throw new Error('Database connection failed. Please try again.');
        } else {
          throw new Error(`Database error: ${error.message}`);
        }
      } else {
        throw new Error('Failed to create or update user: Unknown database error');
      }
    }
  }
  
  /**
   * Map database user to AuthUser type
   */
  private mapDbUserToAuthUser(dbUser: any): AuthUser {
    if (process.env.NODE_ENV === 'development') {
      console.log('Mapping database user to AuthUser:', {
        id: dbUser.id,
        google_id: dbUser.google_id,
        email: dbUser.email,
        name: dbUser.name,
        avatar_url: dbUser.avatar_url,
        display_name: dbUser.display_name
      });
    }

    const authUser = AuthUserSchema.parse({
      id: dbUser.id,
      googleId: dbUser.google_id,
      email: dbUser.email,
      name: dbUser.name,
      avatarUrl: dbUser.avatar_url,
      displayName: dbUser.display_name,
      createdAt: new Date(dbUser.created_at),
      updatedAt: new Date(dbUser.updated_at)
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('Final AuthUser object:', authUser);
    }
    return authUser;
  }
  
  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<AuthUser | null> {
    try {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      
      if (result.length === 0) {
        return null;
      }
      
      return this.mapDbUserToAuthUser(result[0]);
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }
}
