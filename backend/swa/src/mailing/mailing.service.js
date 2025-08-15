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
  async sendVerificationEmail(user, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'smartwrdrobe@gmail.com',
      to: user.email,
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
              <h2>Hi ${user.firstName}!</h2>
              <p>Thank you for signing up for Smart Wardrobe. To complete your registration and start organizing your wardrobe, please verify your email address.</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #6366f1;">${verificationUrl}</p>
              
              <p><strong>This link will expire in 24 hours.</strong></p>
              
              <p>If you didn't create an account with us, please ignore this email.</p>
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
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
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
      throw new Error('Failed to send password reset email');
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
              <h1>✅ Password Changed Successfully</h1>
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
}