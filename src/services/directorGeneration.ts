import type { Asset, AssetType, Clip, Project, ScriptAnalysis, ScriptVersion, Shot } from '../types';

export type GeneratedDirectorData = { versionId: string; assets: Asset[]; clips: Clip[]; shots: Shot[] };

const palette: Record<AssetType, string> = { 角色: '#a94a12', 场景: '#315b72', 道具: '#a57a32' };
const nameOf = (value: string) => value.split('：')[0].split(':')[0].trim() || value.trim();

function assetsFor(values: string[], type: AssetType, versionId: string, offset: number): Asset[] {
  return values.filter(Boolean).map((value, index) => ({
    id: `generated-${versionId}-${offset + index}`,
    type,
    name: nameOf(value),
    description: '',
    tags: ['待完善'],
    status: '待完善',
    color: palette[type],
    scriptVersionId: versionId,
  }));
}

export function generateDirectorData(analysis: ScriptAnalysis, version: ScriptVersion): GeneratedDirectorData {
  const characters = assetsFor(analysis.characters, '角色', version.id, 1);
  const scenes = assetsFor(analysis.scenes, '场景', version.id, 100);
  const props = assetsFor(analysis.props, '道具', version.id, 200);
  const assets = [...characters, ...scenes, ...props];
  const bound = assets.map((asset) => asset.id);
  const scene = scenes[0]?.name || '主要场景';
  const character = characters[0]?.name || '主角';
  const prop = props[0]?.name || '关键道具';
  const clips: Clip[] = [
    { id: `generated-${version.id}-clip-1`, name: 'Clip 01', summary: analysis.summary, scriptVersionId: version.id },
    { id: `generated-${version.id}-clip-2`, name: 'Clip 02', summary: '角色行动与情绪推进', scriptVersionId: version.id },
  ];
  const shots: Shot[] = [
    { id: `generated-${version.id}-shot-1`, clipId: clips[0].id, title: `${scene}建立`, size: '远景 WS', duration: 5, visual: `建立${scene}的空间与氛围，交代故事开端。`, audio: '环境音与远处机械声', assetIds: bound.length ? bound : [], scriptVersionId: version.id },
    { id: `generated-${version.id}-shot-2`, clipId: clips[0].id, title: `${character}出现`, size: '中景 MS', duration: 4, visual: `镜头跟随${character}进入画面，呈现其状态与行动。`, audio: '脚步声与呼吸声', assetIds: bound.length ? bound : [], scriptVersionId: version.id },
    { id: `generated-${version.id}-shot-3`, clipId: clips[1].id, title: `${prop}细节`, size: '特写 CU', duration: 3, visual: `特写${prop}，强调它与当前冲突的关系。`, audio: '细节音效', assetIds: bound.length ? bound : [], scriptVersionId: version.id },
  ];
  return { versionId: version.id, assets, clips, shots };
}

export function applyDirectorGeneration(project: Project, generated: GeneratedDirectorData): Project {
  const keepAsset = (asset: Asset) => Boolean(asset.scriptVersionId) && asset.scriptVersionId !== generated.versionId;
  const keepClip = (clip: Clip) => Boolean(clip.scriptVersionId) && clip.scriptVersionId !== generated.versionId;
  const keepShot = (shot: Shot) => Boolean(shot.scriptVersionId) && shot.scriptVersionId !== generated.versionId;
  return { ...project, assets: [...project.assets.filter(keepAsset), ...generated.assets], clips: [...project.clips.filter(keepClip), ...generated.clips], shots: [...project.shots.filter(keepShot), ...generated.shots] };
}
