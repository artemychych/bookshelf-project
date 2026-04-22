import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterForm from './RegisterForm';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));


describe('RegisterForm ', () => {
  test('рендерит поля: имя, email, пароль, подтверждение и кнопку', () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/имя/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^пароль$/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/подтвердите пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /зарегистрироваться/i })).toBeInTheDocument();
  });

  test('позволяет ввести данные в поля формы', () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );

    const nameInput = screen.getByPlaceholderText(/имя/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/^пароль$/i);
    const confirmInput = screen.getByPlaceholderText(/подтвердите пароль/i);

    fireEvent.change(nameInput, { target: { value: 'Анна' } });
    fireEvent.change(emailInput, { target: { value: 'anna@test.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.change(confirmInput, { target: { value: '123456' } });

    expect(nameInput.value).toBe('Анна');
    expect(emailInput.value).toBe('anna@test.com');
    expect(passwordInput.value).toBe('123456');
    expect(confirmInput.value).toBe('123456');
  });

  test('показывает ошибку, если пароли не совпадают (без отправки формы)', () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );

    const passwordInput = screen.getByPlaceholderText(/^пароль$/i);
    const confirmInput = screen.getByPlaceholderText(/подтвердите пароль/i);
    const submitButton = screen.getByRole('button', { name: /зарегистрироваться/i });

    fireEvent.change(passwordInput, { target: { value: 'qwerty' } });
    fireEvent.change(confirmInput, { target: { value: 'ytrewq' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/пароли не совпадают/i)).toBeInTheDocument();
  });
});