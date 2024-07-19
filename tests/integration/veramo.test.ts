// __tests__/veramo.test.ts

/*import { agent, createAccount } from '../app/lib/auth/authService';
import { IIdentifier } from '@veramo/core';

// Mock the Veramo agent
jest.mock('../app/lib/auth/authService', () => ({
  agent: {
    didManagerCreate: jest.fn(),
    didManagerFind: jest.fn(),
  },
  createAccount: jest.requireActual('../app/lib/auth/authService').createAccount,
}));

describe('Veramo Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an account successfully', async () => {
    const mockIdentifier: IIdentifier = {
      did: 'did:ethr:0x1234567890123456789012345678901234567890',
      provider: 'did:ethr:goerli',
      alias: 'testuser',
      controllerKeyId: 'test-key-id',
      keys: [],
      services: [],
    };

    (agent.didManagerCreate as jest.Mock).mockResolvedValue(mockIdentifier);

    const formData = { username: 'testuser', email: 'test@example.com', password: 'password123' };
    const result = await createAccount(formData);

    expect(agent.didManagerCreate).toHaveBeenCalledWith({
      provider: 'did:ethr:goerli',
      alias: 'testuser',
    });
    expect(result).toEqual(mockIdentifier);
  });

  it('should throw an error when account creation fails', async () => {
    (agent.didManagerCreate as jest.Mock).mockRejectedValue(new Error('Failed to create DID'));

    const formData = { username: 'testuser', email: 'test@example.com', password: 'password123' };
    await expect(createAccount(formData)).rejects.toThrow('Failed to create DID');
  });

  // Add more tests for other Veramo-related functions
});*/