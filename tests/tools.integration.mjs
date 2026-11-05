import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';import {createClient} from '@supabase/supabase-js';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,secret=process.env.SUPABASE_TEST_SERVICE_KEY;
if(!url||!anon||!secret)throw new Error('Supply project test credentials locally.');
const options={auth:{persistSession:false}},admin=createClient(url,secret,options),guest=createClient(url,anon,options),ids=[];
try{
 const clients=[];for(let i=0;i<2;i++){const email=`tools-test-${randomUUID()}@example.com`,password=randomUUID()+randomUUID();const created=await admin.auth.admin.createUser({email,password,email_confirm:true});assert.ifError(created.error);ids.push(created.data.user.id);const c=createClient(url,anon,options);assert.ifError((await c.auth.signInWithPassword({email,password})).error);clients.push(c)}
 const [owner,other]=clients;const init=await owner.rpc('initialize_studio');assert.ifError(init.error);const workspace=init.data;
 const data={title:'Test production',status:'draft',client_name:'Test Client',issuer_name:'Test Studio',lines:[{description:'Creative fee',quantity:1,unit_price:1000,discount:0,tax_rate:10}],paid_amount:0};
 const insert=async(kind,value)=>{const r=await owner.from('studio_records').insert({workspace_id:workspace,kind,data:value}).select().single();assert.ifError(r.error);return r.data};
 const contact=await insert('contacts',{title:'Test contact',email:'contact@example.com',newsletter:true});
 for(const client of [guest,other]){const result=await client.from('studio_records').select('id').eq('id',contact.id);assert.ifError(result.error);assert.equal(result.data.length,0,'Private contact leaked');}
 const forbidden=await other.from('studio_records').insert({workspace_id:workspace,kind:'contacts',data:{title:'Forbidden'}});assert.ok(forbidden.error);
 const invoices=await Promise.all([insert('invoices',data),insert('invoices',data)]);assert.notEqual(invoices[0].data.number,invoices[1].data.number,'Invoice numbers must be unique');
 const inv=invoices[0];assert.ifError((await owner.from('studio_records').update({data:{...inv.data,status:'issued'}}).eq('id',inv.id)).error);
 const edit=await owner.from('studio_records').update({data:{...inv.data,status:'issued',title:'Changed'}}).eq('id',inv.id);assert.ok(edit.error,'Issued invoice must be locked');
 const revert=await owner.from('studio_records').update({data:{...inv.data,status:'draft'}}).eq('id',inv.id);assert.ok(revert.error,'Issued invoice cannot revert to draft');
 const paid=await owner.from('studio_records').update({data:{...inv.data,status:'paid',paid_amount:1100}}).eq('id',inv.id);assert.ifError(paid.error);
 const negative=await owner.from('studio_records').insert({workspace_id:workspace,kind:'invoices',data:{...data,lines:[{description:'Bad',quantity:1,unit_price:-1,discount:0,tax_rate:0}]}});assert.ok(negative.error);
 const proposal=await insert('proposals',{...data,status:'accepted'});const converted=await Promise.all([owner.rpc('convert_studio_proposal',{proposal_id:proposal.id,studio_id:workspace}),owner.rpc('convert_studio_proposal',{proposal_id:proposal.id,studio_id:workspace})]);converted.forEach(r=>assert.ifError(r.error));assert.equal(converted[0].data.id,converted[1].data.id,'Conversion must be idempotent');assert.equal(converted[0].data.kind,'invoices');assert.equal(converted[0].data.data.status,'draft');
 for(const [kind,value] of [['equipment',{title:'Camera',status:'Available'}],['moodboards',{title:'Board',images:[]}],['newsletters',{title:'Draft',subject:'New work',status:'draft'}]])await insert(kind,value);
 const records=await owner.from('studio_records').select('*').eq('workspace_id',workspace);assert.ifError(records.error);assert.equal(records.data.length,8);
 const websites = owner.from('studio_websites');
 const initial = await websites.insert({workspace_id:workspace,draft:{name:'Private draft'}}).select('public_id').single();
 assert.ifError(initial.error);
 const siteId = initial.data.public_id;
 const readPublic = () => guest.rpc('published_studio_website',{site_id:siteId});
 assert.deepEqual((await readPublic()).data, []);
 const crossStudio = await other.from('studio_websites').select('draft').eq('public_id',siteId);
 assert.ifError(crossStudio.error);
 assert.deepEqual(crossStudio.data, []);
 const publish = await owner.from('studio_websites').upsert({workspace_id:workspace,draft:{name:'Published'},published:{name:'Published'}},{onConflict:'workspace_id',defaultToNull:false});
 assert.ifError(publish.error);
 const editDraft = await owner.from('studio_websites').upsert({workspace_id:workspace,draft:{name:'New private edit'}},{onConflict:'workspace_id',defaultToNull:false});
 assert.ifError(editDraft.error);
 const live = await readPublic();
 assert.ifError(live.error);
 assert.equal(live.data[0].settings.name,'Published');
 const offline = await owner.from('studio_websites').update({published:null}).eq('workspace_id',workspace);
 assert.ifError(offline.error);
 assert.deepEqual((await readPublic()).data, []);
 console.log('PASS: website drafts stay private, published settings survive draft edits, and taking a site offline hides it.');
 console.log('PASS: all six record types save privately; cross-studio isolation, concurrent invoice numbering, issued-invoice locks, payments, invalid-price rejection and idempotent proposal conversion.');
}finally{for(const id of ids)assert.ifError((await admin.auth.admin.deleteUser(id)).error);console.log('Temporary test accounts and records removed.');}
