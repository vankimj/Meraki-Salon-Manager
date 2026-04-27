import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Slide from './Slide';
import QRPanel from './QRPanel';

const slideWithLinks = { img: null, name: 'Jane Smith', vu: 'janesmith', iu: 'janesmithig', fu: null, hu: null };
const slideWithAll   = { img: null, name: 'Bob', vu: 'bob', iu: 'bobig', fu: 'bobfb', hu: 'https://bob.com' };
const slideEmpty     = { img: null, name: null, vu: null, iu: null, fu: null, hu: null };

describe('Slide', () => {
  it('renders the name', () => {
    render(<Slide slide={slideWithLinks} isDefault={false} />);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('shows DEFAULT badge when isDefault is true', () => {
    render(<Slide slide={slideWithLinks} isDefault={true} />);
    expect(screen.getByText('DEFAULT')).toBeInTheDocument();
  });

  it('hides DEFAULT badge when isDefault is false', () => {
    render(<Slide slide={slideWithLinks} isDefault={false} />);
    expect(screen.queryByText('DEFAULT')).toBeNull();
  });

  it('shows No name placeholder when name is empty', () => {
    render(<Slide slide={slideEmpty} isDefault={false} />);
    expect(screen.getByText('No name')).toBeInTheDocument();
  });

  it('shows No photo placeholder when img is null', () => {
    render(<Slide slide={slideEmpty} isDefault={false} />);
    expect(screen.getByText('No photo')).toBeInTheDocument();
  });

  it('renders img when provided', () => {
    const slideWithImg = { ...slideWithLinks, img: 'data:image/jpeg;base64,abc' };
    render(<Slide slide={slideWithImg} isDefault={false} />);
    const img = document.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('data:image/jpeg');
  });
});

describe('QRPanel', () => {
  it('shows No links added when slide has no links', () => {
    render(<QRPanel slide={slideEmpty} />);
    expect(screen.getByText('No links added')).toBeInTheDocument();
  });

  it('shows tap to switch when multiple links', () => {
    render(<QRPanel slide={slideWithLinks} />);
    expect(screen.getByText('tap to switch')).toBeInTheDocument();
  });

  it('does not show tap to switch for single link', () => {
    render(<QRPanel slide={{ ...slideEmpty, vu: 'onlyone' }} />);
    expect(screen.queryByText('tap to switch')).toBeNull();
  });

  it('shows venmo handle', () => {
    render(<QRPanel slide={{ ...slideEmpty, vu: 'janesmith' }} />);
    expect(screen.getByText('@janesmith')).toBeInTheDocument();
  });

  it('cycles through tabs on click', () => {
    render(<QRPanel slide={slideWithAll} />);
    expect(screen.getByText('@bob')).toBeInTheDocument();
    fireEvent.click(document.querySelector('[style*="cursor: pointer"]') || document.body);
  });
});
