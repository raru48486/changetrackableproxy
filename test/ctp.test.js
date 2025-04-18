import { expect, test } from 'vitest';
import { ChangeTrackableProxy as ctp } from '../lib/ctp.js';

test('isChanged', () => {
    const a = { a: 1, b: 2, };
    const p = new ctp(a);
    expect(ctp.isChanged(p, 'a')).toBe(false);
    expect(ctp.isChanged(p, 'b')).toBe(false);
    expect(ctp.isChanged(p, 'c')).toBe(false);
    p.a = 100;
    p.c = 'hello';
    expect(ctp.isChanged(p, 'a')).toBe(true);
    expect(ctp.isChanged(p, 'b')).toBe(false);
    expect(ctp.isChanged(p, 'c')).toBe(true);
    expect(ctp.isChanged(p, 'd')).toBe(false);
});

test('getChange', () => {
    const a = { a: 1, b: 2, };
    const p = new ctp(a);
    expect(ctp.getChanges(p)).toEqual({});
    p.a = 100;
    p.c = 'hello';
    expect(ctp.getChanges(p)).toEqual({ a: 100, c: 'hello' });
});

test('getOldValue', () => {
    const a = { a: 'hello' };
    const p = new ctp(a);
    expect(p.a).toBe('hello');
    p.a = 'world';
    expect(p.a).toBe('world');
    expect(ctp.getOldValue(p, 'a')).toBe('hello');
});

test('getSource', () => {
    const a = { x: 'test' };
    const p = new ctp(a);
    expect(ctp.getSource(p)).toBe(a);
});

test('commitChanges', () => {
    const a = { a: 1, b: 2, };
    const p = new ctp(a);
    expect(ctp.getSource(p)).toEqual({ a: 1, b: 2 });
    p.a = 1000;
    p.b = 'hello';
    p.c = 1.2;
    expect(ctp.getSource(p)).toEqual({ a: 1, b: 2 });
    ctp.commitChanges(p);
    expect(ctp.getSource(p)).toEqual({ a: 1000, b: 'hello', c: 1.2 });
});

test('rollbackChanges', () => {
    const a = { a: 1, b: 2, };
    const p = new ctp(a);
    expect(ctp.getSource(p)).toEqual({ a: 1, b: 2 });
    p.a = 1000;
    p.b = 'hello';
    p.c = 1.2;
    expect(ctp.getSource(p)).toEqual({ a: 1, b: 2 });
    ctp.rollbackChanges(p);
    expect(ctp.getSource(p)).toEqual({ a: 1, b: 2 });
});
