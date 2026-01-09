import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
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

const LoginWrapper = () => (
  <BrowserRouter>
    <Login />
  </BrowserRouter>
);

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // UI Rendering Tests
  test('renders login form elements', () => {
    render(<LoginWrapper />);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Email Address or Mobile Number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  // Email Validation Tests
  test('shows error for invalid email format', async () => {
    render(<LoginWrapper />);
    
    const emailInput = screen.getByPlaceholderText('Enter Email Address or Mobile Number');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    await waitFor(() => {
      expect(screen.getByText('Enter a valid email address or 10-digit phone number')).toBeInTheDocument();
    });
  });

  test('shows error for email without @ symbol', async () => {
    render(<LoginWrapper />);
    
    const emailInput = screen.getByPlaceholderText('Enter Email Address or Mobile Number');
    fireEvent.change(emailInput, { target: { value: 'testgmail.com' } });
    
    await waitFor(() => {
      expect(screen.getByText('Enter a valid email address or 10-digit phone number')).toBeInTheDocument();
    });
  });

  test('accepts valid email format', async () => {
    render(<LoginWrapper />);
    
    const emailInput = screen.getByPlaceholderText('Enter Email Address or Mobile Number');
    fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } });
    
    await waitFor(() => {
      expect(screen.queryByText(/enter a valid email/i)).not.toBeInTheDocument();
    });
  });

  // Phone Validation Tests
  test('shows error for invalid phone number', async () => {
    render(<LoginWrapper />);
    
    const phoneInput = screen.getByPlaceholderText('Enter Email Address or Mobile Number');
    fireEvent.change(phoneInput, { target: { value: '123' } });
    
    await waitFor(() => {
      expect(screen.getByText('Phone number must be exactly 10 digits')).toBeInTheDocument();
    });
  });

  test('accepts valid phone number', async () => {
    render(<LoginWrapper />);
    
    const phoneInput = screen.getByPlaceholderText('Enter Email Address or Mobile Number');
    fireEvent.change(phoneInput, { target: { value: '9876543210' } });
    
    await waitFor(() => {
      expect(screen.queryByText(/phone number must be/i)).not.toBeInTheDocument();
    });
  });

  // Form Submission Tests
  test('prevents submission with empty fields', async () => {
    render(<LoginWrapper />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    expect(mockedApi.post).not.toHaveBeenCalled();
  });

  test('successful login with email', async () => {
    const mockResponse = {
      data: {
        access_token: 'mock-token',
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@gmail.com',
          phone: '9876543210',
          is_admin: false
        }
      }
    };
    
    mockedApi.post.mockResolvedValueOnce(mockResponse);
    
    render(<LoginWrapper />);
    
    fireEvent.change(screen.getByPlaceholderText('Enter Email Address or Mobile Number'), {
      target: { value: 'test@gmail.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith('/auth/login/cookie', {
        identifier: 'test@gmail.com',
        password: 'password123'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('handles login error', async () => {
    const mockError = {
      response: {
        data: {
          detail: 'Invalid credentials'
        }
      }
    };
    
    mockedApi.post.mockRejectedValueOnce(mockError);
    window.alert = jest.fn();
    
    render(<LoginWrapper />);
    
    fireEvent.change(screen.getByPlaceholderText('Enter Email Address or Mobile Number'), {
      target: { value: 'test@gmail.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Password'), {
      target: { value: 'wrongpassword' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Invalid credentials');
    });
  });
});