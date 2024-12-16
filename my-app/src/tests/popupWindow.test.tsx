import { render, screen, fireEvent } from '@testing-library/react';
import { describe, vi } from 'vitest';
import React from 'react';
import Popup from '../components/popupWindow';

describe('Popup Component', () => {

  // Test 1: Vérifier que le popup ne s'affiche pas lorsque `show` est false
  it('does not render when show is false', () => {
    render(
      <Popup show={false} title="Test Popup" onClose={vi.fn()}>
        <div>Test Content</div>
      </Popup>
    );
    const popupElement = screen.queryByText('Test Popup');
	expect(document.body.contains(popupElement)).toBe(false);

  });

  // Test 2: Vérifier que le popup s'affiche lorsque `show` est true
  it('renders when show is true', () => {
    render(
      <Popup show={true} title="Test Popup" onClose={vi.fn()}>
        <div>Test Content</div>
      </Popup>
    );
    const popupElement = screen.getByText('Test Popup');
    expect(document.body.contains(popupElement)).toBe(true);
  });

//   Test 3: Vérifier que le titre du popup s'affiche correctement
  it('displays the correct title', () => {
    const title = "Popup Title Test";
    render(
      <Popup show={true} title={title} onClose={vi.fn()}>
        <div>Test Content</div>
      </Popup>
    );
    const titleElement = screen.getByText(title);
    expect(document.body.contains(titleElement)).toBe(true);
  });

  // Test 4: Vérifier que le bouton de fermeture appelle la fonction `onClose`
  it('calls onClose when the close button is clicked', () => {
    const mockOnClose = vi.fn(); // Mock de la fonction onClose
    render(
      <Popup show={true} title="Test Popup" onClose={mockOnClose}>
        <div>Test Content</div>
      </Popup>
    );
    const closeButton = screen.getByText('X');
    fireEvent.click(closeButton); // Simuler un clic sur le bouton de fermeture
    expect(mockOnClose).toHaveBeenCalledTimes(1); // Vérifier que onClose a été appelé une fois
  });
});