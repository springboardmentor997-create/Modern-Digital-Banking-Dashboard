import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../Register';
import api from '@/services/api';

// Mock API
jest.mock('@/services/api');
const mockedApi = api;

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const RegisterWrapper = () => (
  <BrowserRouter>
    <Register />
  </BrowserRouter>
);

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // UI Rendering Tests
  test('renders registration form elements', () => {
    render(<RegisterWrapper />);
    
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Full Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Email Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  // Email Validation Tests
  test('shows error for email without @ symbol', async () => {
    render(<RegisterWrapper />);
    
    const emailInput = screen.getByPlaceholderText('Enter Email Address');
    fireEvent.change(emailInput, { target: { value: 'testgmail.com' } });
    
    await waitFor(() => {
      expect(screen.getByText('Email must contain @ symbol')).toBeInTheDocument();
    });
  });

  test('shows error for invalid email format', async () => {
    render(<RegisterWrapper />);
    
    const emailInput = screen.getByPlaceholderText('Enter Email Address');
    fireEvent.change(emailInput, { target: { value: 'test@' } });
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email format (e.g., user@example.com)')).toBeInTheDocument();
    });
  });

  test('accepts valid email format', async () => {
    render(<RegisterWrapper />);
    
    const emailInput = screen.getByPlaceholderText('Enter Email Address');
    fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } });
    
    await waitFor(() => {
      expect(screen.queryByText(/email must contain/i)).not.toBeInTheDocument();
    });
  });

  // Password Validation Tests
  test('shows error for weak password', async () => {
    render(<RegisterWrapper />);
    
    const passwordInput = screen.getByPlaceholderText('Enter Password');
    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  test('shows error for password without uppercase', async () => {
    render(<RegisterWrapper />);
    
    const passwordInput = screen.getByPlaceholderText('Enter Password');
    fireEvent.change(passwordInput, { target: { value: 'password123!' } });
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password must contain at least one uppercase letter')).toBeInTheDocument();
    });
  });

  test('shows error for password mismatch', async () => {
    render(<RegisterWrapper />);
    
    const passwordInput = screen.getByPlaceholderText('Enter Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
    
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Different123!' } });
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  // Phone Validation Tests
  test('prevents phone number starting with 0', () => {
    render(<RegisterWrapper />);
    
    const phoneInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    fireEvent.change(phoneInput, { target: { value: '0123456789' } });
    
    expect(phoneInput.value).toBe('123456789');
  });

  test('limits phone number to 10 digits', () => {
    render(<RegisterWrapper />);
    
    const phoneInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    fireEvent.change(phoneInput, { target: { value: '12345678901' } });
    
    expect(phoneInput.value).toBe('1234567890');
  });

  // PIN Validation Tests
  test('shows error for invalid PIN', async () => {
    render(<RegisterWrapper />);
    
    const pinInput = screen.getByPlaceholderText('4-digit PIN');
    fireEvent.change(pinInput, { target: { value: '123' } });
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('PIN must be exactly 4 digits')).toBeInTheDocument();
    });
  });

  test('limits PIN to 4 digits', () => {
    render(<RegisterWrapper />);
    
    const pinInput = screen.getByPlaceholderText('4-digit PIN');
    fireEvent.change(pinInput, { target: { value: '12345' } });
    
    expect(pinInput.value).toBe('1234');
  });

  // Form Submission Tests
  test('prevents submission with missing required fields', async () => {
    render(<RegisterWrapper />);
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
    
    expect(mockedApi.post).not.toHaveBeenCalled();
  });

  test('successful registration', async () => {
    const mockResponse = {
      data: {
        message: 'Registration successful'
      }
    };
    
    mockedApi.post.mockResolvedValueOnce(mockResponse);
    window.alert = jest.fn();
    
    render(<RegisterWrapper />);
    
    // Fill all required fields
    fireEvent.change(screen.getByPlaceholderText('Enter Full Name'), {
      target: { value: 'Test User' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Email Address'), {
      target: { value: 'test@gmail.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Password'), {
      target: { value: 'Password123!' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: 'Password123!' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter 10-digit mobile number'), {
      target: { value: '9876543210' }
    });
    fireEvent.change(screen.getByPlaceholderText('4-digit PIN'), {
      target: { value: '1234' }
    });
    fireEvent.change(screen.getByPlaceholderText('Select or Enter Date of Birth'), {
      target: { value: '1990-01-01' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Address'), {
      target: { value: 'Test Address' }
    });
    
    const kycCheckbox = screen.getByRole('checkbox');
    fireEvent.click(kycCheckbox);
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith('/auth/register', {
        name: 'Test User',
        email: 'test@gmail.com',
        password: 'Password123!',
        phone: '9876543210',
        dob: '1990-01-01',
        address: 'Test Address',
        pin_code: '1234',
        kyc_authorize: true
      });
      expect(window.alert).toHaveBeenCalledWith('Registration successful. Please login.');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('handles registration error', async () => {
    const mockError = {
      response: {
        data: {
          detail: 'Email already exists'
        }
      }
    };
    
    mockedApi.post.mockRejectedValueOnce(mockError);
    window.alert = jest.fn();
    
    render(<RegisterWrapper />);
    
    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText('Enter Full Name'), {
      target: { value: 'Test User' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Email Address'), {
      target: { value: 'existing@gmail.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Password'), {
      target: { value: 'Password123!' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: 'Password123!' }
    });
    
    const kycCheckbox = screen.getByRole('checkbox');
    fireEvent.click(kycCheckbox);
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Email already exists');
    });
  });

  test('shows KYC authorization error', async () => {
    render(<RegisterWrapper />);
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please authorize KYC')).toBeInTheDocument();
    });
  });
});