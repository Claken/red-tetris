import { render, screen, fireEvent } from '@testing-library/react';
import { describe, vi } from 'vitest';
import React from 'react';
import Popup from '../components/popupWindow';

describe('Popup Component', () => {

  // Test 1: Verify that the popup is not shown when `show` is false
  it('does not render when show is false', () => {
    render(
      <Popup show={false} title="Test Popup" onClose={vi.fn()}>
        <div>Test Content</div>
      </Popup>
    );
    const popupElement = screen.queryByText('Test Popup');
	expect(document.body.contains(popupElement)).toBe(false);

  });

  // Test 2: Verify that the popup is shown when `show` is true
  it('renders when show is true', () => {
    render(
      <Popup show={true} title="Test Popup" onClose={vi.fn()}>
        <div>Test Content</div>
      </Popup>
    );
    const popupElement = screen.getByText('Test Popup');
    expect(document.body.contains(popupElement)).toBe(true);
  });

//   Test 3: Verify that the popup title is displayed correctly
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

  // Test 4: Verify that the close button calls `onClose`
  it('calls onClose when the close button is clicked', () => {
    const mockOnClose = vi.fn(); // Mock for the onClose function
    render(
      <Popup show={true} title="Test Popup" onClose={mockOnClose}>
        <div>Test Content</div>
      </Popup>
    );
    const closeButton = screen.getByText('X');
    fireEvent.click(closeButton); // Simulate clicking the close button
    expect(mockOnClose).toHaveBeenCalledTimes(1); // Verify that onClose was called once
  });
});