import type { Asset, AssetType, AudioItem, AudioKind, Project, ScriptAnalysis, ScriptVersion, Shot } from '../types';
import { applyDirectorGeneration } from './directorGeneration';

export type ImportedAssetRef = { type:AssetType; name:string };
export type ImportedShot = {
  title:string; size:string; duration:number; visual:string; cameraMove:string; action:string; assets:ImportedAssetRef[]; audioItems:Array<Omit<AudioItem,'id'>>;
};
export type ImportedDirectorPlan = { polishedScript:string; analysis:ScriptAnalysis; clips:Array<{title:string;summary:string;shots:ImportedShot[]}> };

const audioKinds:AudioKind[]=['环境音','对白','旁白','音效','音乐'];
const palette:Record<AssetType,string>={角色:'#a94a12',场景:'#315b72',道具:'#a57a32'};
const analysisFields=['summary','characters','scenes','props','warnings'] as const;
const record=(value:unknown,label:string):Record<string,unknown>=>{if(!value||typeof value!=='object'||Array.isArray(value))throw new Error(`${label} 必须是对象`);return value as Record<string,unknown>};
const text=(value:unknown,label:string)=>{if(typeof value!=='string'||!value.trim())throw new Error(`${label} 必须是非空字符串`);return value.trim()};
const strings=(value:unknown,label:string)=>{if(!Array.isArray(value)||value.some(item=>typeof item!=='string'||!item.trim()))throw new Error(`${label} 必须是字符串数组`);return value.map(item=>item.trim())};

export function buildImportedDirectorPrompt(source:string,label:string):string{return `你是专业动画导演。请将 ${label} 润色为可制作剧本，并完成完整导演台拆解。只返回原始 JSON，不要 Markdown 或说明。必须严格使用此结构：{"polishedScript":"润色后的完整剧本","analysis":{"summary":"摘要","characters":["人物"],"scenes":["场景"],"props":["道具"],"warnings":["待确认项"]},"clips":[{"title":"Clip 01","summary":"该段目标","shots":[{"title":"镜头标题","size":"远景 WS","duration":5,"visual":"画面内容","cameraMove":"镜头运动","action":"人物动作","assets":[{"type":"角色","name":"资产名称"}],"audioItems":[{"kind":"环境音","content":"声音内容","speaker":"可选角色"}]}]}]}。资产 type 只能是 角色、场景、道具。请保留每个镜头的动作、运镜、音频和资产绑定，不要省略字段。\n\n原始剧本：\n${source}`}

export function parseImportedDirectorPlan(input:string):ImportedDirectorPlan{
  let raw:unknown;try{raw=JSON.parse(input)}catch{throw new Error('导入内容不是有效 JSON')}
  const root=record(raw,'导入结果'); const polishedScript=text(root.polishedScript,'polishedScript'); const analysisRecord=record(root.analysis,'analysis');
  const analysis={} as ScriptAnalysis;
  for(const key of analysisFields){const value=analysisRecord[key];if(key==='summary')analysis.summary=text(value,key);else analysis[key]=strings(value,key) as never}
  if(!Array.isArray(root.clips)||!root.clips.length)throw new Error('clips 必须是至少包含一个 Clip 的数组');
  const clips=root.clips.map((rawClip,clipIndex)=>{
    const clip=record(rawClip,`clips[${clipIndex}]`);
    if(!Array.isArray(clip.shots)||!clip.shots.length)throw new Error(`clips[${clipIndex}].shots 必须至少有一个镜头`);
    const shots=clip.shots.map((rawShot,shotIndex)=>{
      const shot=record(rawShot,`shots[${shotIndex}]`); const duration=shot.duration;
      if(typeof duration!=='number'||!Number.isFinite(duration)||duration<=0)throw new Error(`shots[${shotIndex}].duration 必须是大于 0 的数字`);
      if(!Array.isArray(shot.audioItems))throw new Error(`shots[${shotIndex}].audioItems 必须是数组`);
      const audioItems=shot.audioItems.map((rawAudio,audioIndex)=>{
        const item=record(rawAudio,`audioItems[${audioIndex}]`); const kind=text(item.kind,`audioItems[${audioIndex}].kind`) as AudioKind;
        if(!audioKinds.includes(kind))throw new Error(`audioItems[${audioIndex}].kind 不支持`);
        return {kind,content:text(item.content,`audioItems[${audioIndex}].content`),...(typeof item.speaker==='string'&&item.speaker.trim()?{speaker:item.speaker.trim()}:{})};
      });
      if(!Array.isArray(shot.assets))throw new Error(`shots[${shotIndex}].assets 必须是数组`);
      const assets=shot.assets.map((rawAsset,assetIndex)=>{const asset=record(rawAsset,`shots[${shotIndex}].assets[${assetIndex}]`);const type=text(asset.type,`assets[${assetIndex}].type`) as AssetType;if(!(['角色','场景','道具'] as AssetType[]).includes(type))throw new Error(`assets[${assetIndex}].type 不支持`);return {type,name:text(asset.name,`assets[${assetIndex}].name`)}});
      return {title:text(shot.title,`shots[${shotIndex}].title`),size:text(shot.size,`shots[${shotIndex}].size`),duration,visual:text(shot.visual,`shots[${shotIndex}].visual`),cameraMove:text(shot.cameraMove,`shots[${shotIndex}].cameraMove`),action:text(shot.action,`shots[${shotIndex}].action`),assets,audioItems};
    });
    return {title:text(clip.title,`clips[${clipIndex}].title`),summary:text(clip.summary,`clips[${clipIndex}].summary`),shots};
  });
  return {polishedScript,analysis,clips};
}

const assetId=(versionId:string,type:AssetType,index:number)=>`imported-${versionId}-${type}-${index}`;

export function applyImportedDirectorPlan(project:Project,version:ScriptVersion,plan:ImportedDirectorPlan):Project {
  const refs:ImportedAssetRef[]=[...plan.analysis.characters.map(name=>({type:'角色' as AssetType,name})),...plan.analysis.scenes.map(name=>({type:'场景' as AssetType,name})),...plan.analysis.props.map(name=>({type:'道具' as AssetType,name})),...plan.clips.flatMap(clip=>clip.shots.flatMap(shot=>shot.assets))];
  const uniqueRefs=refs.filter((ref,index)=>refs.findIndex(candidate=>candidate.type===ref.type&&candidate.name===ref.name)===index);
  const assets:Asset[]=uniqueRefs.map(({name,type},index)=>{
    const existing=project.assets.find(asset=>asset.scriptVersionId===version.id&&asset.type===type&&asset.name===name)||project.assets.find(asset=>asset.type===type&&asset.name===name);
    return {...existing,id:existing?.scriptVersionId===version.id?existing.id:assetId(version.id,type,index),type,name,description:existing?.description||'',tags:existing?.tags||['待完善'],status:existing?.status||'待完善',color:existing?.color||palette[type],scriptVersionId:version.id};
  });
  const idsFor=(refs:ImportedAssetRef[])=>refs.map(ref=>assets.find(asset=>asset.type===ref.type&&asset.name===ref.name)?.id).filter((id):id is string=>Boolean(id));
  const clips=plan.clips.map((clip,index)=>({id:`imported-${version.id}-clip-${index+1}`,name:clip.title,summary:clip.summary,scriptVersionId:version.id}));
  const shots:Shot[]=plan.clips.flatMap((clip,clipIndex)=>clip.shots.map((shot,shotIndex)=>({id:`imported-${version.id}-shot-${clipIndex+1}-${shotIndex+1}`,clipId:clips[clipIndex].id,title:shot.title,size:shot.size,duration:shot.duration,visual:shot.visual,cameraMove:shot.cameraMove,action:shot.action,audio:shot.audioItems.map(item=>item.content).join(' / '),audioItems:shot.audioItems.map((item,index)=>({id:`imported-${version.id}-audio-${clipIndex+1}-${shotIndex+1}-${index+1}`,...item})),assetIds:idsFor(shot.assets),scriptVersionId:version.id})));
  return applyDirectorGeneration({...project,scriptVersion:version}, {versionId:version.id,assets,clips,shots});
}
