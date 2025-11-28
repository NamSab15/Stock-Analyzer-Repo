import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SearchBar from '../components/SearchBar.jsx';

describe('SearchBar', () => {
  it('renders input with aria-label', () => {
    render(<SearchBar value="" onChange={()=>{}} />);
    const input = screen.getByLabelText(/Search stocks/i);
    expect(input).toBeInTheDocument();
  });
});
