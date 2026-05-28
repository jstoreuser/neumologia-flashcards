import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from './sanitizer';

describe('sanitizeHtml — allowed formatting survives', () => {
  it('keeps basic formatting tags', () => {
    expect(sanitizeHtml('<b>bold</b>')).toBe('<b>bold</b>');
    expect(sanitizeHtml('<strong>x</strong><em>y</em>')).toBe('<strong>x</strong><em>y</em>');
    expect(sanitizeHtml('<p>para</p><ul><li>item</li></ul>')).toBe('<p>para</p><ul><li>item</li></ul>');
  });

  it('passes plain text through unchanged', () => {
    expect(sanitizeHtml('hipertensão pulmonar')).toBe('hipertensão pulmonar');
  });
});

describe('sanitizeHtml — dangerous content is stripped', () => {
  it('removes <script> tags and their content', () => {
    const out = sanitizeHtml('<script>alert("xss")</script>');
    expect(out).not.toContain('<script');
    expect(out).not.toContain('alert');
  });

  it('strips inline event handlers and the src attribute (the XSS vectors)', () => {
    // NOTE: USE_PROFILES.html keeps an inert empty <img> tag, but the dangerous
    // bits (onerror handler, src loader) are removed — which is the real guarantee.
    // Tightening the config to drop <img> entirely is tracked for the security phase.
    const out = sanitizeHtml('<img src="x" onerror="alert(1)">');
    expect(out).not.toContain('onerror');
    expect(out).not.toContain('alert');
    expect(out).not.toContain('src');
  });

  it('removes style attributes from allowed tags', () => {
    const out = sanitizeHtml('<p style="color:red">danger</p>');
    expect(out).toContain('danger');
    expect(out).not.toContain('style');
    expect(out).not.toContain('color:red');
  });

  it('drops href/javascript: vectors (anchor not allowed, text preserved)', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">link</a>');
    expect(out).not.toContain('href');
    expect(out).not.toContain('javascript:');
    expect(out).toContain('link');
  });

  it('strips iframes', () => {
    const out = sanitizeHtml('<iframe src="evil.html"></iframe>');
    expect(out).not.toContain('<iframe');
  });
});
