import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserService } from '../user.service.js';
import { User } from '../entities/user.entity.js';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
    let service;
    let userRepository;

    const mockUser = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
        isVerified: true,
        subscriptionTier: 'free',
        trial: true,
        trialExpires: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date()
    };

    beforeEach(async () => {
        userRepository = {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const module = await Test.createTestingModule({
            providers: [
                UserService,
                { provide: getRepositoryToken(User), useValue: userRepository }
            ],
        }).compile();

        service = module.get(UserService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all users with selected fields', async () => {
            const mockUsers = [mockUser];
            userRepository.find.mockResolvedValue(mockUsers);

            const result = await service.findAll();

            expect(result).toEqual(mockUsers);
            expect(userRepository.find).toHaveBeenCalledWith({
                select: [
                    'id', 'firstName', 'lastName', 'email', 'phoneNumber',
                    'isVerified', 'subscriptionTier', 'trial', 'trialExpires',
                    'createdAt', 'updatedAt', 'lastLoginAt'
                ]
            });
        });

        it('should throw BadRequestException when repository fails', async () => {
            userRepository.find.mockRejectedValue(new Error('DB Error'));

            await expect(service.findAll()).rejects.toThrow(BadRequestException);
        });
    });

    describe('findOneById', () => {
        it('should find a user by id with all profile fields', async () => {
            userRepository.findOne.mockResolvedValue(mockUser);

            const result = await service.findOneById(1);

            expect(result).toEqual(mockUser);
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                select: expect.arrayContaining([
                    'id', 'firstName', 'lastName', 'email', 'phoneNumber',
                    'dateOfBirth', 'gender', 'stylePreferences', 'colorPreferences'
                ])
            });
        });

        it('should throw NotFoundException when user not found', async () => {
            userRepository.findOne.mockResolvedValue(null);

            await expect(service.findOneById(999)).rejects.toThrow(
                new NotFoundException('User with ID 999 not found')
            );
        });

        it('should throw BadRequestException on database error', async () => {
            userRepository.findOne.mockRejectedValue(new Error('DB Error'));

            await expect(service.findOneById(1)).rejects.toThrow(BadRequestException);
        });
    });

    describe('findByEmail', () => {
        it('should find user by email (case insensitive)', async () => {
            userRepository.findOne.mockResolvedValue(mockUser);

            const result = await service.findByEmail('JOHN@EXAMPLE.COM');

            expect(result).toEqual(mockUser);
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { email: 'john@example.com' }
            });
        });

        it('should handle database errors', async () => {
            userRepository.findOne.mockRejectedValue(new Error('DB Error'));

            await expect(service.findByEmail('test@example.com')).rejects.toThrow(BadRequestException);
        });
    });

    describe('findByGoogleId', () => {
        it('should find user by Google ID', async () => {
            userRepository.findOne.mockResolvedValue(mockUser);

            const result = await service.findByGoogleId('google123');

            expect(result).toEqual(mockUser);
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { googleId: 'google123' }
            });
        });
    });

    describe('createUser', () => {
        const validUserData = {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            password: 'password123',
            phoneNumber: '+1234567890',
        };

        beforeEach(() => {
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('hashedPassword');
        });

        it('should create a new user successfully', async () => {
            const createdUser = { ...validUserData, id: 2, password: 'hashedPassword' };
            const { password, ...expectedResponse } = createdUser;

            userRepository.findOne.mockResolvedValue(null); // No existing user
            userRepository.create.mockReturnValue(createdUser);
            userRepository.save.mockResolvedValue(createdUser);

            const result = await service.createUser(validUserData);

            expect(result).toEqual(expectedResponse);
            expect(result.password).toBeUndefined();
            expect(userRepository.create).toHaveBeenCalled();
            expect(userRepository.save).toHaveBeenCalled();
        });

        it('should throw BadRequestException if user already exists', async () => {
            userRepository.findOne.mockResolvedValue(mockUser);

            await expect(service.createUser(validUserData)).rejects.toThrow(
                new BadRequestException('User with this email already exists')
            );
        });

        it('should handle password hashing', async () => {
            userRepository.findOne.mockResolvedValue(null);
            userRepository.create.mockReturnValue(validUserData);
            userRepository.save.mockResolvedValue(validUserData);

            await service.createUser(validUserData);

            expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
        });
    });

    describe('updateUserPreferences', () => {
        const preferences = {
            stylePreferences: ['casual', 'formal'],
            colorPreferences: ['blue', 'black'],
            riskTolerance: 'conservative'
        };

        it('should update user preferences successfully', async () => {
            const updatedUser = { ...mockUser, ...preferences };
            userRepository.findOne.mockResolvedValue(mockUser);
            userRepository.update.mockResolvedValue({ affected: 1 });
            userRepository.findOne.mockResolvedValueOnce(updatedUser);

            const result = await service.updateUserPreferences(1, preferences);

            expect(userRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
                stylePreferences: preferences.stylePreferences,
                colorPreferences: preferences.colorPreferences,
                riskTolerance: preferences.riskTolerance,
                updatedAt: expect.any(Date)
            }));
        });

        it('should throw NotFoundException if user not found', async () => {
            userRepository.findOne.mockResolvedValue(null);

            await expect(service.updateUserPreferences(999, preferences))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('setupUserProfile', () => {
        const profileData = {
            firstName: 'John',
            lastName: 'Updated',
            stylePreferences: ['casual'],
            colorPreferences: ['blue'],
            sizes: { top: 'M', bottom: 'L' },
            primarySize: 'M',
            lifestyle: 'active',
            location: 'New York',
            climate: 'temperate'
        };

        it('should setup user profile successfully', async () => {
            const userWithoutProfile = { ...mockUser, profileSetupCompleted: false };
            userRepository.findOne.mockResolvedValue(userWithoutProfile);
            userRepository.update.mockResolvedValue({ affected: 1 });
            userRepository.findOne.mockResolvedValueOnce({ ...userWithoutProfile, profileSetupCompleted: true });

            const result = await service.setupUserProfile(1, profileData);

            expect(userRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
                profileSetupCompleted: true,
                profileSetupCompletedAt: expect.any(Date),
                firstName: 'John',
                lastName: 'Updated'
            }));
        });

        it('should throw BadRequestException if profile already completed', async () => {
            const userWithProfile = { ...mockUser, profileSetupCompleted: true };
            userRepository.findOne.mockResolvedValue(userWithProfile);

            await expect(service.setupUserProfile(1, profileData))
                .rejects.toThrow(new BadRequestException('Profile setup already completed'));
        });
    });

    describe('verifyUser', () => {
        it('should verify user successfully', async () => {
            userRepository.update.mockResolvedValue({ affected: 1 });
            userRepository.findOne.mockResolvedValue({ ...mockUser, isVerified: true });

            await service.verifyUser(1);

            expect(userRepository.update).toHaveBeenCalledWith(1, {
                isVerified: true,
                verificationToken: null,
                verificationTokenExpires: null,
                updatedAt: expect.any(Date)
            });
        });
    });

    describe('updatePassword', () => {
        it('should update password and clear reset tokens', async () => {
            const hashedPassword = 'newHashedPassword';
            userRepository.update.mockResolvedValue({ affected: 1 });
            userRepository.findOne.mockResolvedValue(mockUser);

            const result = await service.updatePassword(1, hashedPassword);

            expect(userRepository.update).toHaveBeenCalledWith(1, {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
                passwordChangedAt: expect.any(Date),
                updatedAt: expect.any(Date)
            });
        });
    });

    describe('updateLastLogin', () => {
        it('should update last login timestamp', async () => {
            userRepository.update.mockResolvedValue({ affected: 1 });

            await service.updateLastLogin(1);

            expect(userRepository.update).toHaveBeenCalledWith(1, {
                lastLoginAt: expect.any(Date)
            });
        });

        it('should handle errors silently', async () => {
            userRepository.update.mockRejectedValue(new Error('DB Error'));

            // Should not throw
            await expect(service.updateLastLogin(1)).resolves.toBeUndefined();
        });
    });

    describe('checkProfileSetupStatus', () => {
        it('should return profile setup status', async () => {
            const mockStatus = {
                id: 1,
                profileSetupCompleted: true,
                profileSetupCompletedAt: new Date()
            };
            userRepository.findOne.mockResolvedValue(mockStatus);

            const result = await service.checkProfileSetupStatus(1);

            expect(result).toEqual({
                profileSetupCompleted: true,
                profileSetupCompletedAt: mockStatus.profileSetupCompletedAt
            });
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                select: ['id', 'profileSetupCompleted', 'profileSetupCompletedAt']
            });
        });

        it('should throw NotFoundException if user not found', async () => {
            userRepository.findOne.mockResolvedValue(null);

            await expect(service.checkProfileSetupStatus(999))
                .rejects.toThrow(new NotFoundException('User not found'));
        });
    });

    describe('remove', () => {
        it('should delete user successfully', async () => {
            userRepository.delete.mockResolvedValue({ affected: 1 });

            const result = await service.remove(1);

            expect(result).toEqual({ success: true });
            expect(userRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw BadRequestException on delete error', async () => {
            userRepository.delete.mockRejectedValue(new Error('DB Error'));

            await expect(service.remove(1)).rejects.toThrow(BadRequestException);
        });
    });

    describe('Token operations', () => {
        describe('findByVerificationToken', () => {
            it('should find user by verification token', async () => {
                userRepository.findOne.mockResolvedValue(mockUser);

                const result = await service.findByVerificationToken('token123');

                expect(result).toEqual(mockUser);
                expect(userRepository.findOne).toHaveBeenCalledWith({
                    where: { verificationToken: 'token123' }
                });
            });

            it('should return null on error', async () => {
                userRepository.findOne.mockRejectedValue(new Error('DB Error'));

                const result = await service.findByVerificationToken('token123');

                expect(result).toBeNull();
            });
        });

        describe('setVerificationToken', () => {
            it('should set verification token and expiry', async () => {
                const expires = new Date();
                userRepository.update.mockResolvedValue({ affected: 1 });

                await service.setVerificationToken(1, 'token123', expires);

                expect(userRepository.update).toHaveBeenCalledWith(1, {
                    verificationToken: 'token123',
                    verificationTokenExpires: expires,
                    updatedAt: expect.any(Date)
                });
            });
        });
    });

    describe('updateNotificationSettings', () => {
        const settings = {
            enableRecommendations: false,
            enableWeatherNotifications: true,
            morningNotificationTime: '08:00'
        };

        it('should update notification settings', async () => {
            userRepository.findOne.mockResolvedValue(mockUser);
            userRepository.update.mockResolvedValue({ affected: 1 });

            await service.updateNotificationSettings(1, settings);

            expect(userRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
                enableRecommendations: false,
                enableWeatherNotifications: true,
                morningNotificationTime: '08:00',
                updatedAt: expect.any(Date)
            }));
        });
    });
});