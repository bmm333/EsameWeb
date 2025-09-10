import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class MailingService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  createTransporter() {
      return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendAccountDeletionConfirmation(email, firstName = 'User') {
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"Smart Wardrobe" <noreply@smartwardrobe.com>',
        to: email,
        subject: 'Account Deleted - Smart Wardrobe',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Account Deleted</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>👋 Account Deleted</h1>
              </div>
              <div class="content">
                <h2>Goodbye ${firstName}</h2>
                <p>Your Smart Wardrobe account has been permanently deleted as requested.</p>
                
                <p><strong>What was deleted:</strong></p>
                <ul>
                  <li>All profile information</li>
                  <li>Wardrobe items and outfits</li>
                  <li>Preferences and settings</li>
                  <li>Account history and data</li>
                </ul>
                
                <p>If you decide to return in the future, you're always welcome to create a new account.</p>
                
                <p>Thank you for using Smart Wardrobe!</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 Smart Wardrobe. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      try {
        const result = await this.transporter.sendMail(mailOptions);
        console.log('Account deletion confirmation sent:', result.messageId);
        return { success: true, messageId: result.messageId };
      } catch (error) {
        console.error('Error sending account deletion confirmation:', error);
        return { success: false, error: error.message };
      }
  }
  async sendVerificationEmail(user, verificationToken) {
      let email, firstName;
      
      if (typeof user === 'string') {
          email = user;
          firstName = 'User';
          verificationToken = verificationToken;
      } else {
          email = user.email;
          firstName = user.firstName;
      }
      
      if (!email) {
          throw new Error('Email address is required');
      }
      
      if (!verificationToken) {
          throw new Error('Verification token is required');
      }
      
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/verify-email?token=${verificationToken}`;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'smartwrdrobe@gmail.com',
        to: email,
        subject: 'Verify Your Smart Wardrobe Account',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Account</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Smart Wardrobe!</h1>
              </div>
              <div class="content">
                <h2>Hi ${firstName}!</h2>
                <p>Thank you for updating your email address. To complete the verification and ensure delivery of future notifications, please verify your new email address.</p>
                
                <div style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #6366f1;">${verificationUrl}</p>
                
                <p><strong>This link will expire in 24 hours.</strong></p>
                
                <p>If you didn't change your email address, please contact our support team immediately.</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 Smart Wardrobe. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };
      try {
        const result = await this.transporter.sendMail(mailOptions);
        console.log('Verification email sent:', result.messageId);
        return { success: true, messageId: result.messageId };
      } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
      }
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/#/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'smartwrdrobe@gmail.com',
      to: user.email,
      subject: 'Reset Your Smart Wardrobe Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hi ${user.firstName}!</h2>
              <p>We received a request to reset your Smart Wardrobe account password.</p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email and consider changing your password for security.
              </div>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #dc3545;">${resetUrl}</p>
              
              <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
              
              <p>After clicking the link, you'll be able to create a new password for your account.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Smart Wardrobe. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
        const result = await this.transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', result.messageId);
        return { success: true, messageId: result.messageId };
      } catch (error) {
        console.error('Error sending password reset email:', error);
        // Return error instead of throwing
        return { success: false, error: error.message };
    }
  }

  async sendPasswordChangeConfirmation(user) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Smart Wardrobe" <noreply@smartwardrobe.com>',
      to: user.email,
      subject: 'Password Changed Successfully',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Changed</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            .security-notice { background: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; border-radius: 6px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Changed Successfully</h1>
            </div>
            <div class="content">
              <h2>Hi ${user.firstName}!</h2>
              <p>Your Smart Wardrobe account password has been successfully changed.</p>
              <div class="security-notice">
                <strong>🔐 Security Information:</strong>
                <ul>
                  <li>Changed on: ${new Date().toLocaleString()}</li>
                  <li>If you didn't make this change, please contact our support immediately</li>
                  <li>Your account is now secured with your new password</li>
                </ul>
              </div>
              
              <p>For your security:</p>
              <ul>
                <li>Keep your password confidential</li>
                <li>Use a unique password for your Smart Wardrobe account</li>
                <li>Consider using a password manager</li>
              </ul>
              <p>If you have any concerns about your account security, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Smart Wardrobe. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password change confirmation sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending password change confirmation:', error);
      return { success: false, error: error.message };
    }
  }
  async sendRecommendationNotification(user, recommendations) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'smartwrdrobe@gmail.com',
      to: user.email,
      subject: 'New Outfit Recommendations - Smart Wardrobe',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Recommendations</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .recommendation { background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; margin: 10px 0; }
            .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎨 New Outfit Recommendations!</h1>
            </div>
            <div class="content">
              <h2>Hi ${user.firstName}!</h2>
              <p>We've generated some new outfit recommendations for you based on your preferences:</p>
              
              ${recommendations.map(rec => `
                <div class="recommendation">
                  <h3>${rec.outfitName || 'Outfit Recommendation'}</h3>
                  <p><strong>Items:</strong> ${rec.items?.length || 0} items</p>
                  <p><strong>Occasion:</strong> ${rec.occasion || 'General'}</p>
                  <p><strong>Weather:</strong> ${rec.weather || 'Any'}</p>
                </div>
              `).join('')}
              
              <div style="text-align: center;">
                <a href="http://localhost:8080/recommendations" class="button">View Recommendations</a>
              </div>
              
              <p>Check out your Smart Wardrobe app to see the full details and save your favorites!</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Smart Wardrobe. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Recommendation notification sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending recommendation notification:', error);
      return { success: false, error: error.message };
    }
  }
  async sendEmailChangeNotification(oldEmail, newEmail) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Smart Wardrobe" <noreply@smartwardrobe.com>',
      to: oldEmail,
      subject: 'Email Address Changed - Smart Wardrobe',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Address Changed</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ffc107; color: #333; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .security-notice { background: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .new-email { background: #d1ecf1; border: 1px solid #bee5eb; padding: 10px; border-radius: 4px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Email Address Changed</h1>
            </div>
            <div class="content">
              <h2>Security Alert</h2>
              <p>The email address for your Smart Wardrobe account has been successfully changed.</p>
              
              <div class="security-notice">
                <strong>🔐 Change Details:</strong>
                <ul>
                  <li><strong>Previous email:</strong> ${oldEmail}</li>
                  <li><strong>New email:</strong> <span class="new-email">${newEmail}</span></li>
                  <li><strong>Changed on:</strong> ${new Date().toLocaleString()}</li>
                </ul>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important Security Notice:</strong>
                <p>If you did not make this change, your account may have been compromised. Please:</p>
                <ul>
                  <li>Contact our support team immediately</li>
                  <li>Change your password if you still have access</li>
                  <li>Review your account activity</li>
                </ul>
              </div>
              
              <p><strong>What happens next:</strong></p>
              <ul>
                <li>Future account notifications will be sent to your new email address</li>
                <li>You'll need to verify your new email address to ensure delivery</li>
                <li>This old email address will no longer receive Smart Wardrobe notifications</li>
              </ul>
              
              <p>If you made this change, no further action is required. Your account remains secure.</p>
              
              <p>If you have any questions or concerns, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Smart Wardrobe. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email change notification sent to old address:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending email change notification:', error);
      return { success: false, error: error.message };
    }
  }
}