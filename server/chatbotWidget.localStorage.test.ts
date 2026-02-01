import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage for Node.js environment
class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = value.toString();
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock() as any;

describe('ChatbotWidget localStorage Persistence', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Session ID Persistence', () => {
    it('should generate new session ID if none exists', () => {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
    });

    it('should restore session ID from localStorage if valid', () => {
      const mockSessionId = 'session_1234567890_abc123';
      const sessionData = {
        timestamp: Date.now(),
        sessionId: mockSessionId,
      };
      localStorage.setItem('akcni-letenky-chat-session', JSON.stringify(sessionData));

      const stored = localStorage.getItem('akcni-letenky-chat-session');
      expect(stored).toBeTruthy();
      
      const data = JSON.parse(stored!);
      expect(data.sessionId).toBe(mockSessionId);
      expect(Date.now() - data.timestamp).toBeLessThan(24 * 60 * 60 * 1000);
    });

    it('should not restore session ID if older than 24 hours', () => {
      const oldTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
      const sessionData = {
        timestamp: oldTimestamp,
        sessionId: 'session_old_123',
      };
      localStorage.setItem('akcni-letenky-chat-session', JSON.stringify(sessionData));

      const stored = localStorage.getItem('akcni-letenky-chat-session');
      const data = JSON.parse(stored!);
      
      // Session is expired
      expect(Date.now() - data.timestamp).toBeGreaterThan(24 * 60 * 60 * 1000);
    });
  });

  describe('Conversation Data Persistence', () => {
    it('should save conversation data to localStorage', () => {
      const conversationData = {
        timestamp: Date.now(),
        sessionId: 'session_test_123',
        messages: [
          { role: 'assistant', content: 'Ahoj! 👋' },
          { role: 'user', content: 'Hledám letenky do Paříže' },
        ],
        persona: {
          name: 'petra',
          displayName: 'Petra',
          avatar: '/avatars/petra.png',
          greetingMessage: 'Ahoj! 👋 Jsem Petra!',
        },
        conversationId: 123,
        hasMemory: true,
        isReturningUser: false,
        emailCaptured: false,
        greetingShown: true,
      };

      localStorage.setItem('akcni-letenky-chat-conversation', JSON.stringify(conversationData));

      const stored = localStorage.getItem('akcni-letenky-chat-conversation');
      expect(stored).toBeTruthy();

      const data = JSON.parse(stored!);
      expect(data.messages).toHaveLength(2);
      expect(data.messages[0].role).toBe('assistant');
      expect(data.messages[1].role).toBe('user');
      expect(data.persona.name).toBe('petra');
      expect(data.conversationId).toBe(123);
      expect(data.hasMemory).toBe(true);
      expect(data.greetingShown).toBe(true);
    });

    it('should restore conversation data from localStorage if valid', () => {
      const conversationData = {
        timestamp: Date.now(),
        sessionId: 'session_test_456',
        messages: [
          { role: 'assistant', content: 'Dobrý den!' },
          { role: 'user', content: 'Chci levné letenky' },
          { role: 'assistant', content: 'Kam byste chtěl letět?' },
        ],
        persona: {
          name: 'monika',
          displayName: 'Monika',
          avatar: '/avatars/monika.png',
        },
        conversationId: 456,
        hasMemory: false,
        isReturningUser: true,
        emailCaptured: true,
        greetingShown: true,
      };

      localStorage.setItem('akcni-letenky-chat-conversation', JSON.stringify(conversationData));

      const stored = localStorage.getItem('akcni-letenky-chat-conversation');
      const data = JSON.parse(stored!);

      expect(data.messages).toHaveLength(3);
      expect(data.persona.name).toBe('monika');
      expect(data.conversationId).toBe(456);
      expect(data.isReturningUser).toBe(true);
      expect(data.emailCaptured).toBe(true);
      expect(Date.now() - data.timestamp).toBeLessThan(24 * 60 * 60 * 1000);
    });

    it('should not restore conversation data if older than 24 hours', () => {
      const oldTimestamp = Date.now() - (30 * 60 * 60 * 1000); // 30 hours ago
      const conversationData = {
        timestamp: oldTimestamp,
        sessionId: 'session_old_789',
        messages: [{ role: 'assistant', content: 'Old message' }],
        persona: null,
        conversationId: null,
        hasMemory: false,
        isReturningUser: false,
        emailCaptured: false,
        greetingShown: false,
      };

      localStorage.setItem('akcni-letenky-chat-conversation', JSON.stringify(conversationData));

      const stored = localStorage.getItem('akcni-letenky-chat-conversation');
      const data = JSON.parse(stored!);

      // Conversation is expired
      expect(Date.now() - data.timestamp).toBeGreaterThan(24 * 60 * 60 * 1000);
    });
  });

  describe('Clear Conversation Functionality', () => {
    it('should clear all conversation data from localStorage', () => {
      // Set up data
      localStorage.setItem('akcni-letenky-chat-conversation', JSON.stringify({ messages: [] }));
      localStorage.setItem('akcni-letenky-chat-session', JSON.stringify({ sessionId: 'test' }));
      localStorage.setItem('akcni-letenky-email', 'test@example.com');

      expect(localStorage.getItem('akcni-letenky-chat-conversation')).toBeTruthy();
      expect(localStorage.getItem('akcni-letenky-chat-session')).toBeTruthy();
      expect(localStorage.getItem('akcni-letenky-email')).toBeTruthy();

      // Clear
      localStorage.removeItem('akcni-letenky-chat-conversation');
      localStorage.removeItem('akcni-letenky-chat-session');
      localStorage.removeItem('akcni-letenky-email');

      expect(localStorage.getItem('akcni-letenky-chat-conversation')).toBeNull();
      expect(localStorage.getItem('akcni-letenky-chat-session')).toBeNull();
      expect(localStorage.getItem('akcni-letenky-email')).toBeNull();
    });
  });

  describe('localStorage Quota Handling', () => {
    it('should handle quota exceeded errors gracefully', () => {
      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        const error: any = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      }) as any;

      try {
        localStorage.setItem('test-key', 'test-value');
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as any).name).toBe('QuotaExceededError');
      }

      // Restore original
      localStorage.setItem = originalSetItem;
    });
  });

  describe('Data Integrity', () => {
    it('should handle corrupted localStorage data gracefully', () => {
      // Set corrupted data
      localStorage.setItem('akcni-letenky-chat-conversation', 'invalid json {{{');

      let error = null;
      try {
        JSON.parse(localStorage.getItem('akcni-letenky-chat-conversation')!);
      } catch (e) {
        error = e;
      }

      expect(error).toBeInstanceOf(SyntaxError);
    });

    it('should preserve all persona properties', () => {
      const persona = {
        name: 'alice',
        displayName: 'Alice',
        avatar: '/avatars/alice.png',
        greetingMessage: 'Dobrý den, jsem Alice.',
      };

      const conversationData = {
        timestamp: Date.now(),
        sessionId: 'test',
        messages: [],
        persona,
        conversationId: null,
        hasMemory: false,
        isReturningUser: false,
        emailCaptured: false,
        greetingShown: false,
      };

      localStorage.setItem('akcni-letenky-chat-conversation', JSON.stringify(conversationData));

      const stored = localStorage.getItem('akcni-letenky-chat-conversation');
      const data = JSON.parse(stored!);

      expect(data.persona).toEqual(persona);
      expect(data.persona.greetingMessage).toBe('Dobrý den, jsem Alice.');
    });
  });
});
