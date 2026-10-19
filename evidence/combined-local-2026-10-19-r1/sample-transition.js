(async()=>{
 const section=document.querySelector('#scene-discovery'),map=document.querySelector('.persistent-map'),rail=document.querySelector('.map-floor-rail');
 const pause=ms=>new Promise(r=>setTimeout(r,ms));
 const targets=[1.3,1.1,.95,.88,.8,.65,.55,.5,.46,.4,.3,.2].map(n=>n*innerHeight).concat([160,140,120,100]).sort((a,b)=>b-a);
 const samples=[],failed=[];
 for(const direction of ['forward','reverse'])for(const target of direction==='forward'?targets:[...targets].reverse()){
  scrollTo({top:scrollY+section.getBoundingClientRect().top-target,behavior:'instant'});dispatchEvent(new Event('scroll'));await pause(80);
  const deadline=Date.now()+6000;while(document.querySelector('.loading-screen')&&Date.now()<deadline)await pause(40);
  const top=section.getBoundingClientRect().top,opacity=Number(getComputedStyle(map).opacity),progress=Number(document.querySelector('.map-discovery-journey').style.getPropertyValue('--discovery-progress'));
  const railOpacity=getComputedStyle(rail).visibility==='hidden'?0:opacity*Number(getComputedStyle(rail).opacity);
  const svg=map.querySelector('.map-transform svg').getBoundingClientRect();
  const row={direction,target,top,opacity,progress,railOpacity,svg:{top:svg.top,bottom:svg.bottom,left:svg.left,right:svg.right},kind:document.querySelector('.visitor-guide').dataset.view};
  samples.push(row);
  if(top>innerHeight*.79&&top<innerHeight&&opacity>.01)failed.push('Old map visible beside incoming Discovery heading');
  if(top<innerHeight&&railOpacity>.01)failed.push('Old floor rail survives into Discovery entry');
  if(top<innerHeight*.79&&opacity>.01&&progress<.99)failed.push('Map becomes visible before its Discovery composition settles');
  if(svg.height>0&&opacity>.01&&top<innerHeight*.5&&(svg.top<110||svg.bottom>innerHeight+1||svg.left<0||svg.right>innerWidth+1))failed.push('Visible Discovery map is clipped by viewport');
 }
 return {url:location.href,viewport:{width:innerWidth,height:innerHeight},samples,failed:[...new Set(failed)]};
})()

