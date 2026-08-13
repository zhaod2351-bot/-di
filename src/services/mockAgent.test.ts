import { describe, expect, it } from 'vitest';
import { proposeAgentChange } from './mockAgent';
import { demoProject } from '../data/demoProject';

describe('proposeAgentChange', () => {
  it('returns a storyboard proposal with at least one change', () => {
    expect(proposeAgentChange('storyboard', demoProject).changes.length).toBeGreaterThan(0);
  });
});
