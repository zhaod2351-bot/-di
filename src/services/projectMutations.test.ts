import { describe, expect, it } from 'vitest';
import { demoProject } from '../data/demoProject';
import { addAssetVariant, addAudioItem, assetReadiness, bindAsset, createClip, createShot, duplicateShot, moveShot, patchClip, patchShot, removeAsset, removeAssetVariant, removeAudioItem, removeClip, selectShotAssetVariant } from './projectMutations';

describe('project mutations', () => {
  it('creates a new shot for the selected clip', () => {
    const next = createShot(demoProject, 'c1');
    expect(next.shots.filter((shot) => shot.clipId === 'c1')).toHaveLength(4);
  });
  it('removes a deleted asset from every linked shot', () => {
    const next = removeAsset(demoProject, 'a1');
    expect(next.assets.some((asset) => asset.id === 'a1')).toBe(false);
    expect(next.shots.every((shot) => !shot.assetIds.includes('a1'))).toBe(true);
  });
  it('derives readiness from a description and primary reference image', () => {
    const empty = { ...demoProject.assets[0], description: '', referenceImages: [] };
    const described = { ...empty, description: '黑色短发与机能服。' };
    const referenced = { ...empty, referenceImages: [{ id: 'ref', name: 'fox.png', source: 'browser-storage' as const, previewUrl: 'blob:fox', createdAt: '2026-08-14', isPrimary: true }] };
    expect(assetReadiness(empty)).toEqual({ label: '待填写', score: 0 });
    expect(assetReadiness(described)).toEqual({ label: '有描述', score: 1 });
    expect(assetReadiness(referenced)).toEqual({ label: '有参考图', score: 2 });
    expect(assetReadiness({ ...described, referenceImages: referenced.referenceImages })).toEqual({ label: '可用于生成', score: 3 });
  });
  it('assigns a created asset variation to a shot and falls back when it is deleted', () => {
    const withVariation = addAssetVariant(demoProject, 'a1', { id: 'look-battle', name: '战斗造型', description: '破损机能服。' });
    const selected = selectShotAssetVariant(withVariation, 's2', 'a1', 'look-battle');
    expect(selected.shots.find(shot => shot.id === 's2')?.assetVariantIds).toEqual({ a1: 'look-battle' });
    const removed = removeAssetVariant(selected, 'a1', 'look-battle');
    expect(removed.assets.find(asset => asset.id === 'a1')?.variants).toEqual([]);
    expect(removed.shots.find(shot => shot.id === 's2')?.assetVariantIds).toEqual({});
  });
  it('binds an asset to a shot once', () => {
    const next = bindAsset(demoProject, 's1', 'a1');
    expect(next.shots.find((shot) => shot.id === 's1')?.assetIds).toContain('a1');
  });
  it('edits action and audio items without changing another shot', () => {
    const edited = patchShot(demoProject, 's1', { action: '林澈回头示意' });
    const withAudio = addAudioItem(edited, 's1', { id: 'audio-new', kind: '对白', content: '跟紧我', speaker: '林澈' });
    const result = removeAudioItem(withAudio, 's1', 'audio-new');
    expect(result.shots.find((shot) => shot.id === 's1')?.action).toBe('林澈回头示意');
    expect(result.shots.find((shot) => shot.id === 's2')).toEqual(demoProject.shots.find((shot) => shot.id === 's2'));
  });
  it('creates, edits and removes clips with their shots', () => {
    const created = createClip(demoProject);
    const clip = created.clips[created.clips.length-1];
    const edited = patchClip(created, clip.id, { name: '追逐段', summary: '快速逃离' });
    const withShot = createShot(edited, clip.id);
    const removed = removeClip(withShot, clip.id);
    expect(edited.clips[edited.clips.length-1]).toMatchObject({ name: '追逐段', summary: '快速逃离' });
    expect(removed.clips.some((item) => item.id === clip.id)).toBe(false);
    expect(removed.shots.some((shot) => shot.clipId === clip.id)).toBe(false);
  });
  it('duplicates and moves a shot inside its clip', () => {
    const copied = duplicateShot(demoProject, 's1');
    const newShot = copied.shots.find((shot) => shot.id !== 's1' && shot.title.includes('副本'))!;
    const moved = moveShot(copied, newShot.id, -1);
    expect(newShot).toMatchObject({ clipId: 'c1', duration: 5.5, assetIds: ['a3'] });
    expect(moved.shots.filter((shot) => shot.clipId === 'c1')[0].id).toBe(newShot.id);
  });
});
