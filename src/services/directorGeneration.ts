import type { Asset, AssetType, AudioItem, Clip, Project, ScriptAnalysis, ScriptVersion, Shot } from '../types';

export type GeneratedDirectorData = { versionId: string; assets: Asset[]; clips: Clip[]; shots: Shot[] };
export type DirectorPlan = GeneratedDirectorData & { polishedScript:string; beats:string[] };

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

const audio=(id:string,kind:AudioItem['kind'],content:string):AudioItem=>({id,kind,content});

export function createDirectorPlan(analysis:ScriptAnalysis, version:ScriptVersion):DirectorPlan {
  const assets=generateDirectorData(analysis,version).assets;
  const character=assets.find(x=>x.type==='角色')?.name||'主角'; const scene=assets.find(x=>x.type==='场景')?.name||'故事现场'; const prop=assets.find(x=>x.type==='道具')?.name||'关键道具';
  const polishedScript=`在${scene}的压抑氛围中，${character}带着谨慎踏入未知区域。${analysis.summary} 当危机逐步逼近，人物的动作与情绪被推向临界点，${prop}成为扭转局势的关键。故事以余波和新的悬念收束，为下一场行动埋下伏笔。`;
  const beats=['环境建立与危险预示','人物行动与发现','冲突爆发与情绪反应','结果、余波与转场'];
  const clips:Clip[]=beats.map((summary,index)=>({id:`ai-${version.id}-clip-${index+1}`,name:`Clip ${String(index+1).padStart(2,'0')}`,summary,scriptVersionId:version.id}));
  const specs=[
    ['远景 WS',`${scene}建立`,`镜头缓慢推进，建立${scene}的空间层次与压迫感。`,'缓慢推镜',`${character}从画面边缘进入，谨慎观察四周。`,'环境风声与远处机械低鸣'],
    ['中景 MS',`${character}行动`,`跟拍${character}穿过障碍，视线不断扫向前方。`,'肩扛跟拍',`${character}放慢脚步，抬手示意保持安静。`,'脚步踏水与衣料摩擦'],
    ['特写 CU',`危险细节`,`特写${prop}与人物紧握的手指，突出即将发生的变化。`,'定镜微推',`${character}屏住呼吸，手指在关键物件上停顿。`,'细微金属震动'],
    ['近景 MCU',`情绪反应`,`切至人物面部，背景虚化，捕捉紧张和迟疑。`,'快速切换后停住',`${character}回头确认同伴的位置，眼神由犹豫转为坚定。`,'急促呼吸与短促对白'],
    ['全景 LS',`冲突爆发`,`拉开空间距离，交代人物、威胁与逃离路线。`,'横移后急停',`${character}拉住同伴冲向出口，危机在身后逼近。`,'冲击音效与环境声增强'],
    ['远景 WS',`余波转场`,`在余波中缓慢拉远，留下未解决的危险信号。`,'缓慢拉远',`${character}带着同伴消失在雾中，仍回望来路。`,'音乐渐入，机械声未止'],
  ] as const;
  const shots:Shot[]=clips.flatMap((clip,clipIndex)=>specs.slice(clipIndex===3?3:0,clipIndex===3?6:3).map((spec,index)=>({id:`ai-${version.id}-shot-${clipIndex+1}-${index+1}`,clipId:clip.id,title:spec[1],size:spec[0],duration:index===0?5:4,visual:spec[2],cameraMove:spec[3],action:spec[4],audio:spec[5],audioItems:[audio(`audio-${clipIndex}-${index}`,'环境音',spec[5])],assetIds:assets.map(x=>x.id),scriptVersionId:version.id})));
  return {versionId:version.id,assets,clips,shots,polishedScript,beats};
}

export function applyDirectorPlan(project:Project,plan:DirectorPlan):Project { return applyDirectorGeneration(project,plan); }

export function applyDirectorGeneration(project: Project, generated: GeneratedDirectorData): Project {
  const keepAsset = (asset: Asset) => Boolean(asset.scriptVersionId) && asset.scriptVersionId !== generated.versionId;
  const keepClip = (clip: Clip) => Boolean(clip.scriptVersionId) && clip.scriptVersionId !== generated.versionId;
  const keepShot = (shot: Shot) => Boolean(shot.scriptVersionId) && shot.scriptVersionId !== generated.versionId;
  return { ...project, assets: [...project.assets.filter(keepAsset), ...generated.assets], clips: [...project.clips.filter(keepClip), ...generated.clips], shots: [...project.shots.filter(keepShot), ...generated.shots] };
}
