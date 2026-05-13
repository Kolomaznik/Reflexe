import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopNav } from './TopNav.jsx';

describe('TopNav', () => {
  it('renders both page links with the correct hrefs', () => {
    render(<TopNav active="reflexe" />);
    const reflexe = screen.getByRole('link', { name: /Reflexe/ });
    const ukoly = screen.getByRole('link', { name: /Úkoly/ });
    expect(reflexe).toHaveAttribute('href', '/index.html');
    expect(ukoly).toHaveAttribute('href', '/ukoly.html');
  });

  it('marks the active link with aria-current="page"', () => {
    render(<TopNav active="ukoly" />);
    expect(screen.getByRole('link', { name: /Úkoly/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /Reflexe/ })).not.toHaveAttribute('aria-current');
  });

  it('falls back gracefully when active prop is missing', () => {
    render(<TopNav />);
    const links = screen.getAllByRole('link');
    links.forEach((l) => expect(l).not.toHaveAttribute('aria-current'));
  });
});
