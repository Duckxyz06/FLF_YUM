import test from'node:test';
import assert from'node:assert/strict';
import{createAdminAuth,validateAuthConfig}from'../dist/auth.js';
const config={enabled:true,url:'https://example.supabase.co',publishableKey:'sb_publishable_test'};
function fixture({admin=true,active=true,stored=null}={}){
 let time=100000;const values=new Map(stored?[['flf-yum-admin:'+config.url,JSON.stringify(stored)]]:[]),calls=[];
 const storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 const request=async(url,options)=>{calls.push({url,options});let value;if(url.includes('/token?'))value={access_token:'access',refresh_token:'refresh',expires_in:3600};else if(url.endsWith('/user'))value={id:'user-one',email:'admin@example.test'};else if(url.includes('/admin_accounts'))value=admin?[{user_id:'user-one',display_name:'Admin',role:'admin',active}]:[];else return{ok:true,status:204};return{ok:true,status:200,json:async()=>value};};
 return{auth:createAdminAuth(config,{storage,request,clock:()=>time}),values,calls,tick:()=>{time+=3600000;}};
}
test('rejects secret and service_role keys before making requests',()=>{
 assert.throws(()=>validateAuthConfig({...config,publishableKey:'sb_secret_private'}));
 const jwt='e30.'+Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url')+'.signature';
 assert.throws(()=>validateAuthConfig({...config,publishableKey:jwt}));
 assert.throws(()=>validateAuthConfig({...config,url:'http://example.supabase.co'}));
});
test('disabled configuration has no fake admin profile',async()=>{const auth=createAdminAuth({enabled:false},{storage:null});assert.equal(await auth.verify(),null);assert.equal(auth.profile,null);await assert.rejects(()=>auth.login('x','y'));});
test('only authenticated allowlisted active admin can log in; password never saved',async()=>{const f=fixture();assert.equal((await f.auth.login('admin@example.test','private-password')).role,'admin');assert.ok(f.calls.some(c=>c.url.includes('user_id=eq.user-one&active=eq.true')));assert.ok(!JSON.stringify([...f.values]).includes('private-password'));assert.ok(f.calls.every(c=>c.options.headers.apikey===config.publishableKey));});
test('valid auth user without admin membership is denied and session removed',async()=>{const f=fixture({admin:false});await assert.rejects(()=>f.auth.login('a','b'),/quyền admin/);assert.equal(f.auth.profile,null);assert.equal(f.values.size,0);});
test('inactive admin is denied even if REST returns a row',async()=>{const f=fixture({active:false});await assert.rejects(()=>f.auth.login('a','b'));assert.equal(f.values.size,0);});
test('expired session refreshes then verifies admin membership again',async()=>{const f=fixture();await f.auth.login('a','b');f.tick();await f.auth.verify();assert.ok(f.calls.some(c=>c.url.includes('grant_type=refresh_token')));await f.auth.logout();assert.equal(f.auth.profile,null);assert.equal(f.values.size,0);await assert.rejects(()=>f.auth.verify());});
test('network failure fails closed and clears session',async()=>{const values=new Map();const auth=createAdminAuth(config,{storage:{getItem:()=>null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)},request:async()=>{throw Error('Offline');}});await assert.rejects(()=>auth.login('a','b'));assert.equal(auth.profile,null);assert.equal(values.size,0);});
