'use strict';
const CATEGORIES = [
 ['Security & dependency maintenance','Security & dependencies','--s1'],
 ['CI reliability & test infrastructure','CI & test infrastructure','--s2'],
 ['Frontend modernization & UX','Frontend modernization','--s3'],
 ['Releases & upgrade compatibility','Releases & upgrades','--s4'],
 ['Backend runtime & data correctness','Backend correctness','--s5'],
 ['SDK & developer API','SDK & developer API','--s6'],
 ['Documentation & governance','Documentation & governance','--s7']
];
const element = (tag, className, text) => {
 const node = document.createElement(tag);
 if(className) node.className=className;
 if(text!==undefined) node.textContent=text;
 return node;
};
function renderMonthly(prs) {
 const target=document.getElementById('monthly-chart');target.replaceChildren();
 const months=[...new Set(prs.map(pr=>pr.createdAt.slice(0,7)))].sort();
 for(const month of months){
  const subset=prs.filter(pr=>pr.createdAt.startsWith(month));
  const label=new Date(month+'-15T12:00:00Z').toLocaleDateString('en-US',{month:'short',timeZone:'UTC'});
  const row=element('div','month-row');row.append(element('span','',label));
  const stack=element('div','month-stack');
  let accessible=label+': '+subset.length+' PRs. ';
  CATEGORIES.forEach(([category,short,color])=>{
   const count=subset.filter(pr=>pr.category===category).length;
   if(!count)return;
   const segment=element('span');segment.style.width=(count/subset.length*100)+'%';segment.style.background='var('+color+')';
   segment.title=short+': '+count+' ('+(count/subset.length*100).toFixed(1)+'%)';
   accessible+=short+': '+count+'. ';stack.append(segment);
  });
  stack.setAttribute('role','img');stack.setAttribute('aria-label',accessible);
  row.append(stack,element('span','month-count',subset.length));target.append(row);
 }
 const legend=document.getElementById('category-legend');
 CATEGORIES.forEach(([category,short,color])=>{
  const row=element('div','legend-row');const swatch=element('span','swatch');swatch.style.background='var('+color+')';swatch.setAttribute('aria-hidden','true');
  row.append(swatch,element('span','',short),element('span','category-count',prs.filter(pr=>pr.category===category).length));legend.append(row);
 });
}
function renderBreadth(prs){
 const roots=['.github','docs','frontend','backend','test','manifests','sdk','kubernetes_platform','release','api','tools','proxy'];
 const data=roots.map(root=>({root,count:prs.filter(pr=>pr.files.some(path=>path.startsWith(root+'/'))).length}));
 const max=Math.max(...data.map(row=>row.count));
 const target=document.getElementById('breadth-chart');
 for(const item of data){
  const row=element('div','area-row'),head=element('div','area-heading'),track=element('div','area-track'),bar=element('div','area-bar');
  head.append(element('span','',item.root+'/'),element('span','',item.count+' PRs'));
  bar.style.width=(item.count/max*100)+'%';track.setAttribute('aria-hidden','true');track.append(bar);row.append(head,track);target.append(row);
 }
}
function setupInventory(prs){
 const search=document.getElementById('pr-search'),category=document.getElementById('pr-category'),status=document.getElementById('pr-status');
 const count=document.getElementById('pr-count'),list=document.getElementById('pr-list'),more=document.getElementById('show-more');
 const sorted=[...prs].sort((a,b)=>b.number-a.number);let visible=12;
 CATEGORIES.forEach(([name])=>{const option=element('option','',name);option.value=name;category.append(option);});
 function render(){
  const query=search.value.trim().toLowerCase().replace(/^#/,'');
  const filtered=sorted.filter(pr=>(!category.value||pr.category===category.value)&&(!status.value||pr.state===status.value)&&(!query||String(pr.number).includes(query)||pr.title.toLowerCase().includes(query)));
  list.replaceChildren();
  for(const pr of filtered.slice(0,visible)){
   const row=element('article','pr-row');const number=element('span','pr-number','#'+pr.number);const content=element('div');const link=element('a','pr-title',pr.title);link.href=pr.url;
   content.append(link,element('p','pr-meta',pr.category+' · '+pr.createdAt.slice(0,10)));
   row.append(number,content,element('span','status status-'+pr.state.toLowerCase(),pr.state==='CLOSED'?'Closed':pr.state.toLowerCase()));list.append(row);
  }
  count.textContent=filtered.length+' matching PR'+(filtered.length===1?'':'s')+' · showing '+Math.min(visible,filtered.length)+' of '+prs.length+' total';
  if(!filtered.length)list.append(element('p','','No pull requests match these filters.'));
  more.hidden=visible>=filtered.length;
 }
 for(const input of [search,category,status])input.addEventListener(input===search?'input':'change',()=>{visible=12;render();});
 more.addEventListener('click',()=>{visible+=24;render();});render();
}
function renderAdvisories(advisories){
 const target=document.getElementById('advisory-list');
 advisories.filter(a=>a.publisher==='jeffspahr').sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)).forEach(advisory=>{
  const row=element('article','advisory-row'),heading=element('h4'),link=element('a','',advisory.title);link.href=advisory.url;heading.append(link);
  const meta=element('div','advisory-meta');meta.append(element('span','',advisory.id),element('span','',advisory.cve||'No assigned CVE'),element('span','','First patched: '+advisory.patchedVersions.join(', ')));
  row.append(heading,meta,element('p','advisory-reporters','Reporter credit: '+(advisory.reporters.join(', ')||'See advisory')));target.append(row);
 });
}
async function initialize(){
 try{
  const responses=await Promise.all([fetch('data/prs.json'),fetch('data/advisories.json')]);
  if(responses.some(response=>!response.ok))throw new Error('Data request failed');
  const [prs,advisories]=await Promise.all(responses.map(response=>response.json()));
  renderMonthly(prs.prs);renderBreadth(prs.prs);setupInventory(prs.prs);renderAdvisories(advisories.advisories);
 }catch(error){
  const message=element('p','','The interactive data could not load. Use the source data links in Notes & Sources.');message.id='load-error';message.setAttribute('role','alert');document.getElementById('monthly-chart').replaceChildren(message);
 }
}
initialize();
