import { expect, test } from 'vitest';
import { ChangeTrackableProxy as cts} from '../lib/main.js';

test('isChanged', () => {
    const a = { a: 1, b: 2, };
    const p = new cts(a);
    expect(cts.isChanged(p, 'a')).toBe(false);
    expect(cts.isChanged(p, 'b')).toBe(false);
    expect(cts.isChanged(p, 'c')).toBe(false);
    p.a = 100;
    p.c = 'hello';
    expect(cts.isChanged(p, 'a')).toBe(true);
    expect(cts.isChanged(p, 'b')).toBe(false);
    expect(cts.isChanged(p, 'c')).toBe(true);
    expect(cts.isChanged(p, 'd')).toBe(false);
});