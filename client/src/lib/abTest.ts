/**
 * A/B Testing Library
 * 
 * Handles variant assignment, localStorage persistence, and event tracking
 * for A/B tests across the application.
 */

export type ABTestVariant = 'A' | 'B';

export interface ABTestAssignment {
  testName: string;
  variant: ABTestVariant;
  sessionId: string;
  assignedAt: number;
}

/**
 * Generate a unique session ID for tracking
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get or create session ID from localStorage
 */
export function getSessionId(): string {
  const STORAGE_KEY = 'ab_session_id';
  let sessionId = localStorage.getItem(STORAGE_KEY);
  
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(STORAGE_KEY, sessionId);
  }
  
  return sessionId;
}

/**
 * Get variant assignment for a specific test
 * Returns cached assignment if exists, otherwise assigns randomly
 */
export function getVariant(testName: string): ABTestVariant {
  const STORAGE_KEY = `ab_test_${testName}`;
  
  try {
    // Check localStorage for existing assignment
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const assignment: ABTestAssignment = JSON.parse(stored);
      
      // Check if assignment is still valid (within 30 days)
      const daysSinceAssignment = (Date.now() - assignment.assignedAt) / (1000 * 60 * 60 * 24);
      if (daysSinceAssignment < 30) {
        return assignment.variant;
      }
    }
    
    // Assign new variant (50/50 split)
    const variant: ABTestVariant = Math.random() < 0.5 ? 'A' : 'B';
    const sessionId = getSessionId();
    
    const assignment: ABTestAssignment = {
      testName,
      variant,
      sessionId,
      assignedAt: Date.now(),
    };
    
    // Store in localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignment));
    
    // Track assignment on server
    trackAssignment(testName, variant, sessionId).catch(console.error);
    
    return variant;
  } catch (error) {
    console.error('Error in A/B test assignment:', error);
    // Fallback to variant A if localStorage fails
    return 'A';
  }
}

/**
 * Track variant assignment on server
 */
async function trackAssignment(
  testName: string,
  variant: ABTestVariant,
  sessionId: string
): Promise<void> {
  try {
    await fetch('/api/trpc/abTest.trackAssignment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testName,
        variant,
        sessionId,
      }),
    });
  } catch (error) {
    console.error('Failed to track A/B test assignment:', error);
  }
}

/**
 * Track an A/B test event
 */
export async function trackEvent(
  testName: string,
  eventType: string,
  eventData?: Record<string, any>
): Promise<void> {
  const sessionId = getSessionId();
  const variant = getVariant(testName);
  
  try {
    await fetch('/api/trpc/abTest.trackEvent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testName,
        variant,
        sessionId,
        eventType,
        eventData: eventData ? JSON.stringify(eventData) : null,
      }),
    });
  } catch (error) {
    console.error('Failed to track A/B test event:', error);
  }
}

/**
 * Track CTA button click
 */
export function trackCTAClick(testName: string, buttonText: string): void {
  trackEvent(testName, 'cta_click', { buttonText }).catch(console.error);
}

/**
 * Track scroll depth
 */
export function trackScrollDepth(testName: string, depth: number): void {
  trackEvent(testName, `scroll_${depth}`, { depth }).catch(console.error);
}

/**
 * Track form interaction
 */
export function trackFormInteraction(testName: string, fieldName: string): void {
  trackEvent(testName, 'form_interaction', { fieldName }).catch(console.error);
}

/**
 * Track page bounce (user leaves without interaction)
 */
export function trackBounce(testName: string, timeOnPage: number): void {
  trackEvent(testName, 'bounce', { timeOnPage }).catch(console.error);
}

/**
 * React hook for A/B testing
 */
export function useABTest(testName: string): ABTestVariant {
  const [variant, setVariant] = React.useState<ABTestVariant>('A');
  
  React.useEffect(() => {
    setVariant(getVariant(testName));
  }, [testName]);
  
  return variant;
}

// Export for React
import * as React from 'react';
