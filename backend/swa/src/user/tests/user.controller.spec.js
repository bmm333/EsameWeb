import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserController } from '../user.controller.js';
import { UserService } from '../user.service.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';

describe('UserController', () => {
    let controller;
    let userService;
    const mockUser = {
        id: 1,
        firstName: 'Marco',
        lastName: 'Rossi',
        email: 'marco@example.com',
        phoneNumber: '+393334567890',
        isVerified: true,
        subscriptionTier: 'free',
        profileSetupCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    const mockRequest = {
        user: {
            id: 1,
            userId: 1,
            sub: 1
        }
    };

    beforeEach(async () => {
        userService = {
            findAll: jest.fn(),
            findOneById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            setupUserProfile: jest.fn(),
            checkProfileSetupStatus: jest.fn()
        };

        const module = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                { provide: UserService, useValue: userService }
            ]
        })
        .overrideGuard(JwtAuthGuard)
        .useValue({ canActivate: () => true })
        .compile();

        controller = module.get(UserController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all users', async () => {
            const mockUsers = [mockUser];
            userService.findAll.mockResolvedValue(mockUsers);

            const result = await controller.findAll();

            expect(result).toEqual(mockUsers);
            expect(userService.findAll).toHaveBeenCalled();
        });

        it('should handle service errors', async () => {
            userService.findAll.mockRejectedValue(new BadRequestException('Service error'));

            await expect(controller.findAll()).rejects.toThrow(BadRequestException);
        });
    });

    describe('findOne', () => {
        it('should find user by id', async () => {
            userService.findOneById.mockResolvedValue(mockUser);

            const result = await controller.findOne('1');

            expect(result).toEqual(mockUser);
            expect(userService.findOneById).toHaveBeenCalledWith(1);
        });

        it('should handle string ID conversion', async () => {
            userService.findOneById.mockResolvedValue(mockUser);

            await controller.findOne('123');

            expect(userService.findOneById).toHaveBeenCalledWith(123);
        });

        it('should throw BadRequestException for invalid ID', async () => {
            userService.findOneById.mockRejectedValue(new Error('Invalid ID'));

            await expect(controller.findOne('abc')).rejects.toThrow(BadRequestException);
        });

        it('should pass through NotFoundException', async () => {
            const notFoundError = new NotFoundException('User not found');
            userService.findOneById.mockRejectedValue(notFoundError);

            await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
        });

        it('should handle NaN conversion', async () => {
            // NaN gets converted to NaN by parseInt, should be handled by service
            userService.findOneById.mockRejectedValue(new Error('Invalid ID'));

            await expect(controller.findOne('invalid')).rejects.toThrow(BadRequestException);
        });
    });

    describe('create', () => {
        const createUserDto = {
            firstName: 'Giulia',
            lastName: 'Bianchi',
            email: 'giulia@example.com',
            password: 'password123'
        };

        it('should create user successfully', async () => {
            const createdUser = { ...createUserDto, id: 2 };
            userService.create.mockResolvedValue(createdUser);

            const result = await controller.create(createUserDto);

            expect(result).toEqual(createdUser);
            expect(userService.create).toHaveBeenCalledWith(createUserDto);
        });

        it('should handle service errors and log them', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const serviceError = new BadRequestException('Validation failed');
            userService.create.mockRejectedValue(serviceError);

            await expect(controller.create(createUserDto)).rejects.toThrow(BadRequestException);
            expect(consoleSpy).toHaveBeenCalledWith('Error creating user:', serviceError);
            
            consoleSpy.mockRestore();
        });
    });

    describe('update', () => {
        const updateUserDto = {
            firstName: 'Marco Updated',
            lastName: 'Rossi Updated'
        };

        it('should update user successfully', async () => {
            const updatedUser = { ...mockUser, ...updateUserDto };
            userService.update.mockResolvedValue(updatedUser);

            const result = await controller.update('1', updateUserDto);

            expect(result).toEqual(updatedUser);
            expect(userService.update).toHaveBeenCalledWith(1, updateUserDto);
        });

        it('should handle service errors and log them', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const serviceError = new NotFoundException('User not found');
            userService.update.mockRejectedValue(serviceError);

            await expect(controller.update('999', updateUserDto)).rejects.toThrow(NotFoundException);
            expect(consoleSpy).toHaveBeenCalledWith('Error updating user:', serviceError);
            
            consoleSpy.mockRestore();
        });

        // NOTE: Service doesn't have a generic update method
        it('should handle method name mismatch', async () => {
            userService.update.mockRejectedValue(new Error('update is not a function'));

            await expect(controller.update('1', updateUserDto)).rejects.toThrow();
        });
    });

    describe('remove', () => {
        it('should remove user successfully', async () => {
            const removeResult = { success: true };
            userService.remove.mockResolvedValue(removeResult);

            const result = await controller.remove('1');

            expect(result).toEqual(removeResult);
            expect(userService.remove).toHaveBeenCalledWith(1);
        });

        it('should handle service errors and log them', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const serviceError = new BadRequestException('Delete failed');
            userService.remove.mockRejectedValue(serviceError);

            await expect(controller.remove('1')).rejects.toThrow(BadRequestException);
            expect(consoleSpy).toHaveBeenCalledWith('Error deleting user:', serviceError);
            
            consoleSpy.mockRestore();
        });
    });

    describe('setupProfile', () => {
        const profileData = {
            firstName: 'Ben',
            lastName: 'Me',
            stylePreferences: ['casual'],
            location: 'Milano'
        };

        it('should setup profile successfully', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const setupResult = { ...mockUser, profileSetupCompleted: true };
            userService.setupUserProfile.mockResolvedValue(setupResult);

            const result = await controller.setupProfile(mockRequest, profileData);

            expect(result).toEqual({
                statusCode: 200,
                message: 'Profile setup completed successfully',
                user: setupResult
            });
            expect(userService.setupUserProfile).toHaveBeenCalledWith(1, profileData);
            expect(consoleSpy).toHaveBeenCalledWith('UserController: Setting up profile for user:', 1);
            expect(consoleSpy).toHaveBeenCalledWith('UserController: Profile data:', profileData);
            
            consoleSpy.mockRestore();
        });

        it('should handle different user ID formats', async () => {
            const requests = [
                { user: { id: 5 } },
                { user: { userId: 10 } },
                { user: { sub: 15 } },
                { user: { id: 20, userId: 25, sub: 30 } } // should use id first
            ];

            for (let i = 0; i < requests.length; i++) {
                const req = requests[i];
                const expectedId = req.user.id || req.user.userId || req.user.sub;
                
                userService.setupUserProfile.mockResolvedValue(mockUser);

                await controller.setupProfile(req, profileData);

                expect(userService.setupUserProfile).toHaveBeenCalledWith(expectedId, profileData);
            }
        });

        it('should handle service errors and log them', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const serviceError = new BadRequestException('Profile setup failed');
            userService.setupUserProfile.mockRejectedValue(serviceError);

            await expect(controller.setupProfile(mockRequest, profileData)).rejects.toThrow(BadRequestException);
            expect(consoleSpy).toHaveBeenCalledWith('Profile setup controller error:', serviceError);
            
            consoleSpy.mockRestore();
        });

        it('should handle undefined user ID', async () => {
            const reqWithoutUser = { user: {} };
            userService.setupUserProfile.mockResolvedValue(mockUser);

            await controller.setupProfile(reqWithoutUser, profileData);

            expect(userService.setupUserProfile).toHaveBeenCalledWith(undefined, profileData);
        });
    });

    describe('getProfileSetupStatus', () => {
        it('should get profile setup status successfully', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const statusResult = {
                profileSetupCompleted: true,
                profileSetupCompletedAt: new Date()
            };
            userService.checkProfileSetupStatus.mockResolvedValue(statusResult);

            const result = await controller.getProfileSetupStatus(mockRequest);

            expect(result).toEqual({
                profileSetupCompleted: true,
                profileSetupCompletedAt: statusResult.profileSetupCompletedAt,
                needsProfileSetup: false
            });
            expect(userService.checkProfileSetupStatus).toHaveBeenCalledWith(1);
            expect(consoleSpy).toHaveBeenCalledWith('UserController: Getting profile setup status for user:', 1);
            
            consoleSpy.mockRestore();
        });

        it('should handle incomplete profile setup', async () => {
            const statusResult = {
                profileSetupCompleted: false,
                profileSetupCompletedAt: null
            };
            userService.checkProfileSetupStatus.mockResolvedValue(statusResult);

            const result = await controller.getProfileSetupStatus(mockRequest);

            expect(result).toEqual({
                profileSetupCompleted: false,
                profileSetupCompletedAt: null,
                needsProfileSetup: true
            });
        });

        it('should handle service errors and log them', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const serviceError = new NotFoundException('User not found');
            userService.checkProfileSetupStatus.mockRejectedValue(serviceError);

            await expect(controller.getProfileSetupStatus(mockRequest)).rejects.toThrow(NotFoundException);
            expect(consoleSpy).toHaveBeenCalledWith('Profile setup status error:', serviceError);
            
            consoleSpy.mockRestore();
        });
    });

    describe('getProfile', () => {
        it('should get user profile successfully', async () => {
            userService.findOneById.mockResolvedValue(mockUser);

            const result = await controller.getProfile(mockRequest);

            expect(result).toEqual(mockUser);
            expect(userService.findOneById).toHaveBeenCalledWith(1);
        });

        it('should handle service errors and log them', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const serviceError = new NotFoundException('User not found');
            userService.findOneById.mockRejectedValue(serviceError);

            await expect(controller.getProfile(mockRequest)).rejects.toThrow(NotFoundException);
            expect(consoleSpy).toHaveBeenCalledWith('Error getting user profile:', serviceError);
            
            consoleSpy.mockRestore();
        });

        it('should handle undefined user ID', async () => {
            const reqWithoutId = { user: {} };
            userService.findOneById.mockResolvedValue(mockUser);

            await controller.getProfile(reqWithoutId);

            expect(userService.findOneById).toHaveBeenCalledWith(undefined);
        });
    });

    describe('ID parsing edge cases', () => {
        it('should handle various string number formats', async () => {
            const testCases = [
                { input: '0', expected: 0 },
                { input: '123', expected: 123 },
                { input: '  456  ', expected: 456 }, 
                { input: '789.99', expected: 789 }, 
                { input: 'NaN', expected: NaN },
                { input: '', expected: NaN }
            ];

            for (const testCase of testCases) {
                userService.findOneById.mockResolvedValue(mockUser);
                
                try {
                    await controller.findOne(testCase.input);
                    expect(userService.findOneById).toHaveBeenCalledWith(testCase.expected);
                } catch (error) {
                    if (!isNaN(testCase.expected)) {
                        throw error;
                    }
                }
            }
        });
    });
});