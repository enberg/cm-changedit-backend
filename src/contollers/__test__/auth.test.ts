import { Request, Response } from 'express';
import { describe, expect, test, beforeEach, jest, afterEach } from '@jest/globals';
import { logIn, profile } from '../auth';
import User from '../../models/User';

jest.mock('../../models/User');

let UserMock: jest.Mocked<typeof User>;

describe('userController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        UserMock = jest.mocked(User);
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // test('loginUser returns token if user is found and password matches', async () => {
    //     UserMock.findOne.mockResolvedValue({ userName: 'test',  password: 'hashedPassword' });
    //     mockRequest.body = { username: 'test', password: 'password' };

    //     await logIn(mockRequest as Request, mockResponse as Response);

    //     expect(mockResponse.status).toHaveBeenCalledWith(200);
    //     expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Login successful', token: 'token', refreshToken: 'token', username: 'test', userId: 'test' });
    // });

    // test('loginUser returns 401 if user is not found or password does not match', async () => {
    //     UserMock.findOne.mockResolvedValue(null);
    //     mockRequest.body = { username: 'test', password: 'password' };

    //     await logIn(mockRequest as Request, mockResponse as Response);

    //     expect(mockResponse.status).toHaveBeenCalledWith(401);
    //     expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid username or password' });
    // });

    test('profile returns user data if user is found', async () => {
        UserMock.findById.mockResolvedValue({ _id: 'anId', userName: 'test' });
        mockRequest.params = { id: 'userId' };

        await profile(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ id: 'anId', userName: 'test' });
    });

    test('profile returns 404 if user is not found', async () => {
        UserMock.findById.mockResolvedValue(null);
        mockRequest.params = { id: 'userId' };

        await profile(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
});