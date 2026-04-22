import { render, screen, fireEvent } from '@testing-library/react';
import BookCard from './BookCard';

describe('BookCard', () => {
  const mockOnAdd = jest.fn();

  const externalBook = {
    id: 'ext-1',
    title: 'Внешняя книга',
    authorNames: ['Автор Неизвестный'],
    coverUrl: 'https://example.com/cover.jpg',
    source: 'openlibrary',
    status: 'none',
  };

  const libraryBook = {
    id: 'lib-1',
    title: 'Книга из библиотеки',
    authorNames: ['Известный Автор'],
    coverUrl: 'https://example.com/cover2.jpg',
    source: 'database',
    status: 'want_to_read',
  };

  test('рендерит внешнюю книгу с кнопкой "Добавить"', () => {
    render(
      <BookCard
        book={externalBook}
        onAdd={mockOnAdd}
        onUpdateStatus={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(screen.getByText('Внешняя книга')).toBeInTheDocument();
    expect(screen.getByText('Автор Неизвестный')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /добавить/i })).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  test('при клике на кнопку "Добавить" вызывается колбэк onAdd с книгой', () => {
    render(
      <BookCard
        book={externalBook}
        onAdd={mockOnAdd}
        onUpdateStatus={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    const addButton = screen.getByRole('button', { name: /добавить/i });
    fireEvent.click(addButton);
    expect(mockOnAdd).toHaveBeenCalledTimes(1);
    expect(mockOnAdd).toHaveBeenCalledWith(externalBook);
  });

  test('рендерит книгу из библиотеки с селектом статуса и кнопками действий', () => {
    render(
      <BookCard
        book={libraryBook}
        onAdd={jest.fn()}
        onUpdateStatus={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(screen.getByText('Книга из библиотеки')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /написать рецензию/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /удалить/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /добавить/i })).not.toBeInTheDocument();
  });
});