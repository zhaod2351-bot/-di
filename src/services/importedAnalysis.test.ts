import { describe, expect, it } from 'vitest';
import { buildChatGptPrompt, parseImportedAnalysis } from './importedAnalysis';

describe('imported analysis', () => {
  it('builds a prompt that includes the episode source and JSON-only contract', () => {
    expect(buildChatGptPrompt('小狐来到旧街。', '1-1 v1')).toContain('JSON');
  });
  it('parses a valid ChatGPT analysis result', () => {
    expect(parseImportedAnalysis('{"summary":"测试","characters":["小狐"],"scenes":[],"props":[],"warnings":[]}').characters).toEqual(['小狐']);
  });
  it('rejects a malformed result', () => {
    expect(() => parseImportedAnalysis('{"summary":"测试"}')).toThrow('characters');
  });
});
