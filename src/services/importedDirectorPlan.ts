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
const pick=(item:Record<string,unknown>,...keys:string[])=>keys.map(key=>item[key]).find(value=>value!==undefined);
const durationOf=(value:unknown,label:string)=>{if(typeof value==='number'&&Number.isFinite(value)&&value>0)return value;if(typeof value==='string'){const parsed=Number.parseFloat(value.replace(/[^0-9.]/g,''));if(Number.isFinite(parsed)&&parsed>0)return parsed}throw new Error(`${label} 必须是大于 0 的数字`)};

export function buildImportedDirectorPrompt(source:string,label:string):string{return `你是专业动画导演。请将 ${label} 润色为可制作剧本，并完成完整导演台拆解。只返回原始 JSON，不要 Markdown 或说明。必须严格使用此结构：{"polishedScript":"润色后的完整剧本","analysis":{"summary":"摘要","characters":["人物"],"scenes":["场景"],"props":["道具"],"warnings":["待确认项"]},"clips":[{"title":"Clip 01","summary":"该段目标","shots":[{"title":"镜头标题","size":"远景 WS","duration":5,"visual":"画面内容","cameraMove":"镜头运动","action":"人物动作","assets":[{"type":"角色","name":"资产名称"}],"audioItems":[{"kind":"环境音","content":"声音内容","speaker":"可选角色"}]}]}]}。资产 type 只能是 角色、场景、道具。请保留每个镜头的动作、运镜、音频和资产绑定，不要省略字段。\n\n原始剧本：\n${source}`}

export function parseImportedDirectorPlan(input:string):ImportedDirectorPlan{
  let raw:unknown;try{raw=JSON.parse(input)}catch{throw new Error('导入内容不是有效 JSON')}
  const root=record(raw,'导入结果'); const polishedScript=text(pick(root,'polishedScript','润色剧本','润色后的剧本','润色后完整剧本','润色后的完整剧本','剧本正文','剧本'),'polishedScript'); const analysisRecord=record(root.analysis||{summary:pick(root,'summary','剧情概要','摘要'),characters:pick(root,'characters','人物'),scenes:pick(root,'scenes','场景'),props:pick(root,'props','道具'),warnings:pick(root,'warnings','警告','待确认项')||[]},'analysis');
  const analysis={} as ScriptAnalysis;
  for(const key of analysisFields){const value=analysisRecord[key];if(key==='summary')analysis.summary=text(value,key);else analysis[key]=strings(value,key) as never}
  const importedClips=pick(root,'clips','clipList','剪辑列表','分镜列表');
  if(!Array.isArray(importedClips)||!importedClips.length)throw new Error('clips 必须是至少包含一个 Clip 的数组');
  const clips=importedClips.map((rawClip,clipIndex)=>{
    const clip=record(rawClip,`clips[${clipIndex}]`);
    const importedShots=pick(clip,'shots','镜头列表','镜头');
    if(!Array.isArray(importedShots)||!importedShots.length)throw new Error(`clips[${clipIndex}].shots 必须至少有一个镜头`);
    const shots=importedShots.map((rawShot,shotIndex)=>{
      const shot=record(rawShot,`shots[${shotIndex}]`); const duration=durationOf(pick(shot,'duration','时长'),`shots[${shotIndex}].duration`);
      const importedAudioItems=pick(shot,'audioItems','音频','声音');
      if(!Array.isArray(importedAudioItems))throw new Error(`shots[${shotIndex}].audioItems 必须是数组`);
      const audioItems=importedAudioItems.map((rawAudio,audioIndex)=>{
        const item=record(rawAudio,`audioItems[${audioIndex}]`); const kind=text(pick(item,'kind','type','类型'),`audioItems[${audioIndex}].kind`) as AudioKind;
        if(!audioKinds.includes(kind))throw new Error(`audioItems[${audioIndex}].kind 不支持`);
        return {kind,content:text(pick(item,'content','name','内容'),`audioItems[${audioIndex}].content`),...(typeof pick(item,'speaker','角色','说话人')==='string'&&String(pick(item,'speaker','角色','说话人')).trim()?{speaker:String(pick(item,'speaker','角色','说话人')).trim()}:{})};
      });
      const importedAssets=pick(shot,'assets','资产');
      if(!Array.isArray(importedAssets))throw new Error(`shots[${shotIndex}].assets 必须是数组`);
      const assets=importedAssets.map((rawAsset,assetIndex)=>{const asset=record(rawAsset,`shots[${shotIndex}].assets[${assetIndex}]`);const type=text(pick(asset,'type','类型'),`assets[${assetIndex}].type`) as AssetType;if(!(['角色','场景','道具'] as AssetType[]).includes(type))throw new Error(`assets[${assetIndex}].type 不支持`);return {type,name:text(pick(asset,'name','名称'),`assets[${assetIndex}].name`)}});
      return {title:text(pick(shot,'title','标题','镜头标题'),`shots[${shotIndex}].title`),size:text(pick(shot,'size','景别'),`shots[${shotIndex}].size`),duration,visual:text(pick(shot,'visual','画面'),`shots[${shotIndex}].visual`),cameraMove:text(pick(shot,'cameraMove','运镜','镜头语言'),`shots[${shotIndex}].cameraMove`),action:text(pick(shot,'action','角色动作','动作'),`shots[${shotIndex}].action`),assets,audioItems};
    });
    return {title:text(pick(clip,'title','name','名称'),`clips[${clipIndex}].title`),summary:text(pick(clip,'summary','摘要','剧情概要'),`clips[${clipIndex}].summary`),shots};
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
