import { describe, it, expect } from 'vitest';
import { buildCallReplacement, buildTemplateCallReplacement } from '../src/text';

describe('buildCallReplacement', () => {
  it('omits optional parameters when args are missing or undefined', () => {
    const result = buildCallReplacement(
      'foo',
      ['cmd', undefined],
      ['cmd', 'val'],
      [false, true]
    );

    expect(result).toBe('foo({ cmd })');
  });

  it('keeps optional parameters when values are provided', () => {
    const result = buildCallReplacement(
      'foo',
      ['cmd', '0'],
      ['cmd', 'val'],
      [false, true]
    );

    expect(result).toBe('foo({ cmd, val:0 })');
  });

  it('uses shorthand syntax when the argument matches the parameter name', () => {
    const result = buildCallReplacement(
      'foo',
      ['firstName', 'lastName'],
      ['firstName', 'lastName'],
      [false, false]
    );

    expect(result).toBe('foo({ firstName, lastName })');
  });
});

describe('buildTemplateCallReplacement', () => {
  const source = 'foo(bar, baz)';

  it('returns null when argument count exceeds parameter count', () => {
    const result = buildTemplateCallReplacement(source, 0, ['bar'], [false]);
    expect(result).toBeNull();
  });

  it('builds replacement and omits optional properties', () => {
    const template = 'foo(name)';
    const result = buildTemplateCallReplacement(
      template,
      0,
      ['name', 'val'],
      [false, true]
    );

    expect(result).not.toBeNull();
    expect(result?.replacement).toBe('foo({ name })');
  });
});
