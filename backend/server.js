const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();
const multer = require('multer');
const path = require('path');

const app = express();


// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());


app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));




// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Create uploads directory if it doesn't exist
      const uploadDir = 'uploads/';
      if (!require('fs').existsSync(uploadDir)) {
        require('fs').mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // Generate unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  const fileFilter = (req, file, cb) => {
    // Accept only PDF and DOC files
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
    }
  };
  
  const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    }
  });













// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  position: { type: String, default: 'HR Personnel' },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: { type: Date, default: Date.now }
});




const User = mongoose.model('User', userSchema);

// Email Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// JWT Token Generation
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', { 
    expiresIn: '7d' 
  });
};

// Email Verification Function
const sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: '✉️ Verify Your HR Management Account',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to HR Management System!</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin-top: 20px;">
          <h2 style="color: #333;">Hello ${user.firstName} ${user.lastName}!</h2>
          <p style="color: #666; font-size: 16px;">
            Thank you for registering with our HR Management System. To complete your registration and access all features, please verify your email address.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;
                      font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link in your browser:<br>
            <a href="${verificationUrl}" style="color: #667eea;">${verificationUrl}</a>
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            This verification link will expire in 24 hours for security reasons.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>If you didn't create this account, please ignore this email.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', user.email);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error('Failed to send verification email');
  }
};

// Password Reset Email Function
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: '🔐 Reset Your Password - HR Management System',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0;">Password Reset Request</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin-top: 20px;">
          <h2 style="color: #333;">Hello ${user.firstName}!</h2>
          <p style="color: #666; font-size: 16px;">
            We received a request to reset your password for your HR Management System account.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;
                      font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link in your browser:<br>
            <a href="${resetUrl}" style="color: #ff6b6b;">${resetUrl}</a>
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            This password reset link will expire in 1 hour for security reasons.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', user.email);
  } catch (error) {
    console.error('❌ Password reset email failed:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Routes

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'HR Management System API is running!',
    version: '1.0.0',
    endpoints: {
      signup: 'POST /api/auth/signup',
      login: 'POST /api/auth/login',
      verifyEmail: 'GET /api/auth/verify-email',
      forgotPassword: 'POST /api/auth/forgot-password',
      resetPassword: 'POST /api/auth/reset-password',
      me: 'GET /api/auth/me',
      health: 'GET /api/health'
    }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running!' 
  });
});

// GET USER PROFILE ROUTE - MOVED TO CORRECT POSITION
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ 
      success: true, 
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        position: user.position,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Profile error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 1. SIGNUP ROUTE
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      position: 'HR Personnel',
      verificationToken,
      isVerified: false
    });

    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user, verificationToken);
      
      res.status(201).json({
        success: true,
        message: 'Account created successfully! Please check your email to verify your account.',
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          position: user.position,
          isVerified: user.isVerified
        }
      });
    } catch (emailError) {
      // If email fails, delete the user and return error
      await User.findByIdAndDelete(user._id);
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// 2. EMAIL VERIFICATION ROUTE
app.get('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    console.log('🔍 Verification attempt with token:', token);

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // First, try to find user with the token
    const user = await User.findOne({ verificationToken: token });
    console.log('👤 User found with token:', user ? 'Yes' : 'No');

    if (!user) {
      // If no user found with token, check if there's a verified user 
      // This handles the case where token was already used
      const verifiedUser = await User.findOne({ 
        isVerified: true,
        verificationToken: { $exists: false }
      });
      
      if (verifiedUser) {
        console.log('👤 Found already verified user, token was likely used');
        return res.status(200).json({
          success: true,
          message: 'This verification link has already been used. Your email is already verified and you can log in.',
          alreadyVerified: true
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'Email is already verified. You can now log in.',
        alreadyVerified: true
      });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined; // Clear the token
    await user.save();

    console.log('✅ User verified successfully:', user.email);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in to your account.',
      verified: true
    });

  } catch (error) {
    console.error('❌ Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during verification'
    });
  }
});

// RESEND VERIFICATION ROUTE
app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified. You can log in.'
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Update user with new token
    user.verificationToken = verificationToken;
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user, verificationToken);
      
      res.status(200).json({
        success: true,
        message: 'Verification email sent successfully! Please check your inbox.'
      });
    } catch (emailError) {
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 3. LOGIN ROUTE
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please verify your email before logging in' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        position: user.position,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// 4. FORGOT PASSWORD ROUTE
// 4. FORGOT PASSWORD ROUTE
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'No account found with this email address' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Save reset token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Send password reset email
    try {
      await sendPasswordResetEmail(user, resetToken);
      
      res.status(200).json({
        success: true,
        message: 'Password reset link has been sent to your email'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again.'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// 5. RESET PASSWORD ROUTE
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired password reset token' 
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});





const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET // <-- add client secret here
);

// Google Login Route
app.get('/api/auth/google', (req, res) => {
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    prompt: 'consent',
    redirect_uri: 'http://localhost:5000/api/auth/google/callback'
  });
  res.redirect(url);
});

// Google Callback Route
app.get('/api/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await client.getToken({
      code,
      redirect_uri: 'http://localhost:5000/api/auth/google/callback'
    });

    // Set the credentials to the client (optional but good practice)
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, given_name: firstName, family_name: lastName } = payload;

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        firstName: firstName || 'Google',
        lastName: lastName || 'User',
        email,
        password: crypto.randomBytes(16).toString('hex'),
        isVerified: true
      });
      await user.save();
    }

    // Generate token
    // After generating token
const token = generateToken(user._id);

// Build redirect URL with extra user data as query params
const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth-redirect`);

redirectUrl.searchParams.append('token', token);
redirectUrl.searchParams.append('userId', user._id);
redirectUrl.searchParams.append('firstName', user.firstName || '');
redirectUrl.searchParams.append('lastName', user.lastName || '');
redirectUrl.searchParams.append('email', user.email || '');

res.redirect(redirectUrl.toString());


    res.redirect(`${process.env.FRONTEND_URL}/auth-redirect?token=${token}&userId=${user._id}`);
  } catch (error) {
    console.error('Google auth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
  }
});





// Job Schema and Routes
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  positions: { type: Number, required: true },
  requirements: [String],
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  postedDate: { type: Date, default: Date.now },
  applications: { type: Number, default: 0 },
  interviewed: { type: Number, default: 0 },
  rejected: { type: Number, default: 0 },
  feedbackPending: { type: Number, default: 0 },
  offered: { type: Number, default: 0 }
});

const Job = mongoose.model('Job', jobSchema);

// Get all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedDate: -1 });
    res.status(200).json({ success: true, jobs });
  } catch (err) {
    console.error('Get jobs error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create job
app.post('/api/jobs', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const job = new Job({
      ...req.body,
      postedBy: user._id
    });

    await job.save();
    res.status(201).json({ success: true, job });
  } catch (err) {
    console.error('Create job error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});




// Candidate Schema (update this to match your experience structure)
const candidateSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    resume: String,
    coverLetter: String,
    appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    experience: [{
      company: String,
      position: String,
      years: String // Keep as 'years' since that's what your backend expects
    }],
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedDate: { type: Date, default: Date.now }
  });
  
  const Candidate = mongoose.model('Candidate', candidateSchema);






  // GET single candidate by ID
app.get('/api/candidates/:id', async (req, res) => {
    try {
      // 1. Authentication
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // 2. Find candidate that belongs to this user
      const candidate = await Candidate.findOne({
        _id: req.params.id,
        addedBy: user._id
      }).populate('appliedJobs', 'title description requirements positions');
  
      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: 'Candidate not found'
        });
      }
  
      // 3. Add full URL paths to file fields
      const candidateWithFullPaths = {
        ...candidate.toObject(),
        resume: candidate.resume ? `${req.protocol}://${req.get('host')}/${candidate.resume}` : null,
        coverLetter: candidate.coverLetter ? `${req.protocol}://${req.get('host')}/${candidate.coverLetter}` : null
      };
  
      res.status(200).json({
        success: true,
        candidate: candidateWithFullPaths
      });
  
    } catch (err) {
      console.error('Get candidate error:', err);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching candidate'
      });
    }
  });
  
  // CORRECTED: Get all candidates (with authentication filter)
  app.get('/api/candidates', async (req, res) => {
    try {
      // Check authorization
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
  
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Fetch candidates for this user only, with populated job details
      const candidates = await Candidate.find({ addedBy: user._id })
        .populate('appliedJobs', 'title description requirements positions')
        .sort({ addedDate: -1 });
      
      // Add full URL paths to file fields
      const candidatesWithFullPaths = candidates.map(candidate => ({
        ...candidate.toObject(),
        resume: candidate.resume ? `${req.protocol}://${req.get('host')}/${candidate.resume}` : null,
        coverLetter: candidate.coverLetter ? `${req.protocol}://${req.get('host')}/${candidate.coverLetter}` : null
      }));
      
      res.status(200).json({ 
        success: true, 
        candidates: candidatesWithFullPaths 
      });
    } catch (err) {
      console.error('Get candidates error:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching candidates' 
      });
    }
  });
  
  // CORRECTED: Create candidate (your existing code is mostly good, just small improvements)
  // CORRECTED: Create candidate (fixed the job validation issue)
  app.post('/api/candidates', upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'coverLetter', maxCount: 1 }
  ]), async (req, res) => {
    console.log('=== CANDIDATE CREATION DEBUG ===');
    console.log('1. Request received');
    console.log('2. Headers:', req.headers);
    console.log('3. Body:', req.body);
    console.log('4. Files:', req.files);
    
    try {
      // Check authorization
      console.log('5. Checking authorization...');
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        console.log('❌ No token provided');
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      console.log('✅ Token found:', token.substring(0, 20) + '...');

      // Verify token
      console.log('6. Verifying token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      console.log('✅ Token decoded:', decoded);
      
      // Find user
      console.log('7. Finding user...');
      const user = await User.findById(decoded.userId);
      if (!user) {
        console.log('❌ User not found');
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      console.log('✅ User found:', user.email);

      // Parse JSON fields
      console.log('8. Parsing JSON fields...');
      let appliedJobs = [];
      let experience = [];
      
      try {
        appliedJobs = req.body.appliedJobs ? JSON.parse(req.body.appliedJobs) : [];
        experience = req.body.experience ? JSON.parse(req.body.experience) : [];
        console.log('✅ JSON parsed - appliedJobs:', appliedJobs, 'experience:', experience);
      } catch (parseError) {
        console.log('❌ JSON parse error:', parseError);
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid JSON format in appliedJobs or experience' 
        });
      }

      // FIXED: Validate that applied jobs exist in the system (removed user ownership check)
      if (appliedJobs.length > 0) {
        console.log('9. Validating applied jobs...');
        console.log('Applied job IDs to validate:', appliedJobs);
        
        // First, validate ObjectId format
        const invalidIds = appliedJobs.filter(id => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
          console.log('❌ Invalid ObjectId format:', invalidIds);
          return res.status(400).json({ 
            success: false, 
            message: `Invalid job ID format: ${invalidIds.join(', ')}` 
          });
        }
        
        // FIXED: Check if jobs exist in the system (removed postedBy filter)
        // Candidates can apply to ANY job in the system, not just jobs posted by current user
        const validJobs = await Job.find({ 
          _id: { $in: appliedJobs }
          // Removed: postedBy: user._id - this was the problem!
        });
        
        console.log('Valid jobs found:', validJobs.length, 'out of', appliedJobs.length);
        console.log('Valid job IDs:', validJobs.map(job => job._id.toString()));
        console.log('Valid job details:', validJobs.map(job => ({
          id: job._id.toString(),
          title: job.title,
          postedBy: job.postedBy
        })));
        
        if (validJobs.length !== appliedJobs.length) {
          console.log('❌ Some applied jobs do not exist in the system');
          
          // Find which job IDs are invalid
          const validJobIds = validJobs.map(job => job._id.toString());
          const invalidJobIds = appliedJobs.filter(id => !validJobIds.includes(id));
          console.log('Invalid/non-existent job IDs:', invalidJobIds);
          
          return res.status(400).json({ 
            success: false, 
            message: `Some applied jobs do not exist in the system. Invalid IDs: ${invalidJobIds.join(', ')}` 
          });
        }
        console.log('✅ All applied jobs exist in the system');
      }

      // Handle file paths
      console.log('10. Processing files...');
      const resumePath = req.files && req.files.resume ? req.files.resume[0].path : null;
      const coverLetterPath = req.files && req.files.coverLetter ? req.files.coverLetter[0].path : null;
      console.log('✅ File paths - resume:', resumePath, 'coverLetter:', coverLetterPath);

      // FIXED: Convert appliedJobs string IDs to ObjectIds for proper MongoDB storage
      console.log('11. Converting job IDs to ObjectIds...');
      const appliedJobObjectIds = appliedJobs.map(id => new mongoose.Types.ObjectId(id));
      console.log('✅ Converted to ObjectIds:', appliedJobObjectIds);

      // Create candidate data
      console.log('12. Creating candidate data...');
      const candidateData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone || '',
        resume: resumePath,
        coverLetter: coverLetterPath,
        appliedJobs: appliedJobObjectIds, // Use ObjectIds instead of strings
        experience: experience,
        addedBy: user._id
      };
      console.log('✅ Candidate data:', candidateData);

      // Validate required fields
      console.log('13. Validating required fields...');
      if (!candidateData.firstName || !candidateData.lastName || !candidateData.email) {
        console.log('❌ Missing required fields');
        return res.status(400).json({ 
          success: false, 
          message: 'First name, last name, and email are required' 
        });
      }
      console.log('✅ Required fields validated');

      // Check for existing candidate for this user only
      console.log('14. Checking for existing candidate...');
      const existingCandidate = await Candidate.findOne({ 
        email: candidateData.email,
        addedBy: user._id // Only check within this user's candidates
      });
      if (existingCandidate) {
        console.log('❌ Candidate already exists for this user');
        return res.status(400).json({ 
          success: false, 
          message: 'A candidate with this email already exists in your database' 
        });
      }
      console.log('✅ No existing candidate found');

      // Create new candidate
      console.log('15. Creating candidate...');
      const candidate = new Candidate(candidateData);
      await candidate.save();
      console.log('✅ Candidate saved:', candidate._id);
      
      // Update job application counts for ALL jobs (not just user's jobs)
      console.log('16. Updating job counts...');
      if (appliedJobObjectIds.length > 0) {
        const updateResult = await Job.updateMany(
          { _id: { $in: appliedJobObjectIds } },
          { $inc: { applications: 1 } }
        );
        console.log('✅ Job counts updated:', updateResult);
      }

      // Populate response
      console.log('17. Populating response...');
      const populatedCandidate = await Candidate.findById(candidate._id)
        .populate('appliedJobs', 'title description requirements positions company location');
      
      console.log('✅ Populated candidate appliedJobs:', populatedCandidate.appliedJobs);
      
      // Add full URL paths to response
      const candidateWithFullPaths = {
        ...populatedCandidate.toObject(),
        resume: populatedCandidate.resume ? `${req.protocol}://${req.get('host')}/${populatedCandidate.resume}` : null,
        coverLetter: populatedCandidate.coverLetter ? `${req.protocol}://${req.get('host')}/${populatedCandidate.coverLetter}` : null
      };
      
      console.log('✅ Response populated');

      res.status(201).json({ 
        success: true, 
        candidate: candidateWithFullPaths,
        message: 'Candidate added successfully!'
      });
      console.log('✅ Success response sent');

    } catch (err) {
      console.error('❌ ERROR in candidate creation:', err);
      console.error('Error stack:', err.stack);
      
      // Handle multer errors
      if (err instanceof multer.MulterError) {
        console.log('❌ Multer error:', err.code, err.message);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            success: false, 
            message: 'File size too large. Maximum 5MB allowed.' 
          });
        }
        return res.status(400).json({ 
          success: false, 
          message: 'File upload error: ' + err.message 
        });
      }

      // Handle file filter errors
      if (err.message && err.message.includes('Only PDF, DOC, and DOCX files are allowed')) {
        console.log('❌ File filter error:', err.message);
        return res.status(400).json({ 
          success: false, 
          message: err.message 
        });
      }

      console.log('❌ Generic server error');
      res.status(500).json({ 
        success: false, 
        message: 'Server error while creating candidate' 
      });
    }
  });







  
  
  // Your delete route is already good, just keeping it as is
  app.delete('/api/candidates/:id', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      const user = await User.findById(decoded.userId);
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Find candidate that belongs to this user
      const candidate = await Candidate.findOne({ 
        _id: req.params.id, 
        addedBy: user._id 
      });
      
      if (!candidate) {
        return res.status(404).json({ 
          success: false, 
          message: 'Candidate not found' 
        });
      }
  
      // Delete associated files
      const fs = require('fs');
      if (candidate.resume && fs.existsSync(candidate.resume)) {
        fs.unlinkSync(candidate.resume);
      }
      if (candidate.coverLetter && fs.existsSync(candidate.coverLetter)) {
        fs.unlinkSync(candidate.coverLetter);
      }
  
      // Update job application counts
      if (candidate.appliedJobs.length > 0) {
        await Job.updateMany(
          { _id: { $in: candidate.appliedJobs } },
          { $inc: { applications: -1 } }
        );
      }
  
      await Candidate.findByIdAndDelete(req.params.id);
  
      res.status(200).json({ 
        success: true, 
        message: 'Candidate deleted successfully' 
      });
    } catch (err) {
      console.error('Delete candidate error:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while deleting candidate' 
      });
    }
  });




  // Add this GET endpoint for fetching candidates (add this to your API routes)
// Updated GET endpoint for fetching candidates with better data structure
app.get('/api/candidates', async (req, res) => {
    console.log('=== CANDIDATES API CALLED ===');
    
    try {
        // 1. Authentication
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        console.log(`Fetching candidates for user: ${user.email}`);

        // 2. Get raw candidates first
        const rawCandidates = await Candidate.find({ addedBy: user._id }).sort({ addedDate: -1 });
        console.log(`Found ${rawCandidates.length} candidates in database`);

        if (rawCandidates.length === 0) {
            return res.json({
                success: true,
                candidates: [],
                count: 0,
                message: 'No candidates found'
            });
        }

        // 3. Check Job model availability
        let Job;
        try {
            Job = mongoose.model('Job');
            const jobCount = await Job.countDocuments();
            console.log(`Job model found. Total jobs in database: ${jobCount}`);
        } catch (modelError) {
            console.error('❌ Job model not found or error:', modelError.message);
            // If Job model is not available, return candidates without job details
            const candidatesWithoutJobs = rawCandidates.map(candidate => ({
                ...candidate.toObject(),
                appliedJobs: [], // Empty array since we can't populate
                appliedJobsCount: candidate.appliedJobs?.length || 0,
                appliedJobIds: candidate.appliedJobs || [], // Keep original IDs for reference
                resume: candidate.resume ? `${req.protocol}://${req.get('host')}/${candidate.resume}` : null,
                coverLetter: candidate.coverLetter ? `${req.protocol}://${req.get('host')}/${candidate.coverLetter}` : null,
                experience: candidate.experience || []
            }));

            return res.json({
                success: true,
                candidates: candidatesWithoutJobs,
                count: candidatesWithoutJobs.length,
                warning: 'Job details could not be loaded'
            });
        }





        // Save evaluation for a candidate
app.post('/api/candidates/:id/evaluation', async (req, res) => {
  try {
    // Authentication check
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update candidate with evaluation
    const candidate = await Candidate.findOneAndUpdate(
      { _id: req.params.id, addedBy: user._id },
      { evaluation: req.body.evaluation },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    res.status(200).json({ success: true, candidate });
  } catch (err) {
    console.error('Error saving evaluation:', err);
    res.status(500).json({ success: false, message: 'Server error while saving evaluation' });
  }
});

        




        




    


















  




        // 4. Manually populate jobs for each candidate
        const candidatesWithJobs = await Promise.all(
            rawCandidates.map(async (candidate) => {
                const candidateData = candidate.toObject();
                let populatedJobs = [];
                
                console.log(`Processing candidate: ${candidateData.firstName} ${candidateData.lastName}`);
                console.log(`  - Applied jobs IDs: ${candidateData.appliedJobs}`);

                if (candidateData.appliedJobs && candidateData.appliedJobs.length > 0) {
                    // Process each job ID
                    for (const jobId of candidateData.appliedJobs) {
                        try {
                            console.log(`  - Looking for job with ID: ${jobId}`);
                            const job = await Job.findById(jobId);
                            
                            if (job) {
                                console.log(`  ✅ Found job: "${job.title}" at ${job.company || 'Unknown Company'}`);
                                populatedJobs.push({
                                    _id: job._id,
                                    title: job.title,
                                    company: job.company,
                                    description: job.description,
                                    requirements: job.requirements,
                                    positions: job.positions,
                                    location: job.location,
                                    salary: job.salary,
                                    postedDate: job.postedDate
                                });
                            } else {
                                console.log(`  ❌ Job not found with ID: ${jobId}`);
                                // Add placeholder for missing job
                                populatedJobs.push({
                                    _id: jobId,
                                    title: 'Job Not Found',
                                    company: 'Unknown',
                                    description: 'This job may have been deleted',
                                    requirements: [],
                                    positions: 0,
                                    location: 'Unknown',
                                    salary: null,
                                    postedDate: null,
                                    _isDeleted: true
                                });
                            }
                        } catch (jobError) {
                            console.error(`  ❌ Error fetching job ${jobId}:`, jobError.message);
                            // Add error placeholder
                            populatedJobs.push({
                                _id: jobId,
                                title: 'Error Loading Job',
                                company: 'Error',
                                description: 'Failed to load job details',
                                _hasError: true
                            });
                        }
                    }
                }

                console.log(`  - Successfully populated ${populatedJobs.length} jobs`);

                return {
                    _id: candidateData._id,
                    firstName: candidateData.firstName,
                    lastName: candidateData.lastName,
                    email: candidateData.email,
                    phone: candidateData.phone,
                    resume: candidateData.resume ? `${req.protocol}://${req.get('host')}/${candidateData.resume}` : null,
                    coverLetter: candidateData.coverLetter ? `${req.protocol}://${req.get('host')}/${candidateData.coverLetter}` : null,
                    experience: candidateData.experience || [],
                    appliedJobs: populatedJobs,
                    addedBy: candidateData.addedBy,
                    addedDate: candidateData.addedDate,
                    
                    // Additional helpful fields
                    appliedJobsCount: populatedJobs.length,
                    experienceCount: candidateData.experience?.length || 0,
                    hasResume: !!candidateData.resume,
                    hasCoverLetter: !!candidateData.coverLetter
                };
            })
        );

        // 5. Final summary
        console.log('=== FINAL PROCESSING SUMMARY ===');
        console.log(`Total candidates processed: ${candidatesWithJobs.length}`);
        console.log('Candidates summary:');
        candidatesWithJobs.forEach((candidate, index) => {
            console.log(`  ${index + 1}. ${candidate.firstName} ${candidate.lastName}:`);
            console.log(`     - Applied to ${candidate.appliedJobsCount} jobs`);
            console.log(`     - Jobs: ${candidate.appliedJobs.map(job => job.title).join(', ') || 'None'}`);
        });

        res.json({
            success: true,
            candidates: candidatesWithJobs,
            count: candidatesWithJobs.length,
            summary: {
                totalCandidates: candidatesWithJobs.length,
                totalJobApplications: candidatesWithJobs.reduce((sum, c) => sum + c.appliedJobsCount, 0),
                candidatesWithJobs: candidatesWithJobs.filter(c => c.appliedJobsCount > 0).length
            }
        });

    } catch (error) {
        console.error('❌ Fatal error in candidates route:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching candidates',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});




  // Add this DELETE endpoint for candidates (add this to your API routes)
app.delete('/api/candidates/:id', async (req, res) => {
    console.log('=== DELETING CANDIDATE ===');
    
    try {
      // Check authorization
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
  
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      
      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      const candidateId = req.params.id;
      console.log('Deleting candidate:', candidateId, 'for user:', user.email);
  
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(candidateId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid candidate ID format' 
        });
      }
  
      // Find candidate and ensure it belongs to the user
      const candidate = await Candidate.findOne({ 
        _id: candidateId, 
        addedBy: user._id 
      });
  
      if (!candidate) {
        return res.status(404).json({ 
          success: false, 
          message: 'Candidate not found or you do not have permission to delete it' 
        });
      }
  
      // Store file paths before deletion for cleanup
      const filesToDelete = [];
      if (candidate.resume) filesToDelete.push(candidate.resume);
      if (candidate.coverLetter) filesToDelete.push(candidate.coverLetter);
  
      // Update job application counts (decrease by 1 for each applied job)
      if (candidate.appliedJobs && candidate.appliedJobs.length > 0) {
        await Job.updateMany(
          { _id: { $in: candidate.appliedJobs } },
          { $inc: { applications: -1 } }
        );
        console.log('Updated job application counts');
      }
  
      // Delete the candidate
      await Candidate.findByIdAndDelete(candidateId);
      console.log('Candidate deleted from database');
  
      // Clean up files (optional - you might want to keep files for backup)
      const fs = require('fs').promises;
      for (const filePath of filesToDelete) {
        try {
          await fs.unlink(filePath);
          console.log('Deleted file:', filePath);
        } catch (fileError) {
          console.log('Could not delete file:', filePath, fileError.message);
          // Don't fail the request if file deletion fails
        }
      }
  
      res.json({
        success: true,
        message: 'Candidate deleted successfully'
      });
  
    } catch (error) {
      console.error('Error deleting candidate:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while deleting candidate'
      });
    }
  });












  app.get('/api/jobs/:id', async (req, res) => {
    try {
      const job = await Job.findById(req.params.id)
        .populate('postedBy', 'firstName lastName email');
      
      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }
  
      res.status(200).json({ success: true, job });
    } catch (err) {
      console.error('Get job error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  
  app.get('/api/search', async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || q.length < 2) {
        return res.status(200).json({ success: true, results: [] });
      }
  
      // Search jobs
      const jobResults = await Job.find({
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { requirements: { $in: [new RegExp(q, 'i')] } }
        ]
      })
      .populate('postedBy', 'firstName lastName')
      .sort({ postedDate: -1 })
      .limit(5);
  
      // Transform job results
      const jobs = jobResults.map(job => ({
        _id: job._id,
        title: job.title,
        description: job.description,
        positions: job.positions,
        applications: job.applications,
        postedDate: job.postedDate,
        postedBy: job.postedBy,
        type: 'job',
        daysAgo: Math.floor((new Date() - new Date(job.postedDate)) / (1000 * 60 * 60 * 24)) + ' days ago'
      }));
  
      // If you have candidates collection, add candidate search here
      // const candidateResults = await Candidate.find({...}).limit(5);
      // const candidates = candidateResults.map(candidate => ({...}));
  
      const results = [...jobs]; // Add candidates here when ready: [...jobs, ...candidates]
  
      res.status(200).json({ success: true, results });
    } catch (err) {
      console.error('Search error:', err);
      res.status(500).json({ success: false, message: 'Search error' });
    }
  });


const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Make sure to configure your email settings in .env file`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
});