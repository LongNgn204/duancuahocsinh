import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React, { useState } from 'react';
import { useAI } from '../../src/hooks/useAI';

function TestComp() {
  const { messages, sendMessage, loading } = useAI();
  const [text, setText] = useState('hello');
  return (
    <div>
      <input aria-label="msg" value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={() => sendMessage(text)} disabled={loading}>send</button>
      <ul>
        {messages.map((m, i) => (
          <li key={i} data-role={m.role}>{m.content}</li>
        ))}
      </ul>
    </div>
  );
}

describe('useAI dev echo', () => {
  it('appends assistant DEV_ECHO when no endpoint set', async () => {
    render(<TestComp />);
    fireEvent.click(screen.getByText('send'));
    await waitFor(() => {
      expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(2);
    });
    const items = screen.getAllByRole('listitem');
    expect(items[0].textContent).toBe('hello');
    expect(items[1].textContent?.startsWith('[DEV MODE]')).toBe(true);
  });
});

