export function validateAuthConfig(config) {
  if (!config.enabled) return false;
  let url;try { url=new URL(config.url); } catch { throw Error('Chưa cấu hình URL Supabase hợp lệ.'); }
  if(url.protocol!=='https:'||url.pathname!=='/'||url.search||url.hash||url.username||url.password)throw Error('URL Supabase phải dùng HTTPS và không có đường dẫn.');
  const key=config.publishableKey||'';
  if(!key)throw Error('Chưa cấu hình khóa công khai Supabase.');
  if(key.startsWith('sb_secret_'))throw Error('Không được dùng khóa bí mật trong web.');
  if(!key.startsWith('sb_publishable_')){
    try {const payload=JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));if(payload.role!=='anon')throw Error();}
    catch {throw Error('Chỉ dùng publishable key hoặc anon key.');}
  }
  return true;
}

// The database is the authority for admin access; user-editable metadata is ignored.
export function createAdminAuth(config,{request=fetch,storage=globalThis.sessionStorage,clock=()=>Date.now()}={}) {
  const enabled=validateAuthConfig(config),slot='flf-yum-admin:'+config.url;
  let session=null,profile=null,refreshing=null;
  try{session=JSON.parse(storage?.getItem(slot)||'null');}catch{session=null;}
  const clear=()=>{session=null;profile=null;storage?.removeItem(slot);};
  const save=value=>{if(!value?.access_token||!value?.refresh_token||!Number.isFinite(value.expires_in))throw Error('Phiên đăng nhập không hợp lệ.');session={access_token:value.access_token,refresh_token:value.refresh_token,expires_at:clock()+value.expires_in*1000};storage?.setItem(slot,JSON.stringify(session));};
  async function api(path,{method='GET',body,token}={}){
    const response=await request(config.url.replace(/\/$/,'')+path,{method,headers:{apikey:config.publishableKey,...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),cache:'no-store',signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw Error(response.status===400||response.status===401?'Email, mật khẩu hoặc phiên đăng nhập không hợp lệ.':response.status===403?'Tài khoản không có quyền quản trị.':'Không kết nối được dịch vụ tài khoản. Vui lòng kiểm tra cấu hình và thử lại.');
    if(response.status===204)return null;
    return response.json();
  }
  async function verify(){
    if(!enabled)return null;
    if(!session)throw Error('Vui lòng đăng nhập tài khoản admin.');
    try{
      if(!Number.isFinite(session.expires_at)||session.expires_at<=clock()+30000){
        refreshing||=api('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refresh_token}}).then(save).finally(()=>{refreshing=null;});
        await refreshing;
      }
      const user=await api('/auth/v1/user',{token:session.access_token});
      const rows=await api('/rest/v1/admin_accounts?select=user_id,display_name,role,active&user_id=eq.'+encodeURIComponent(user.id)+'&active=eq.true',{token:session.access_token});
      if(!Array.isArray(rows)||rows.length!==1||rows[0].user_id!==user.id||!rows[0].active||rows[0].role!=='admin')throw Error('Tài khoản chưa được cấp quyền admin hoặc đã bị khóa.');
      profile={...rows[0],email:user.email};return profile;
    }catch(error){clear();throw error;}
  }
  return {enabled,get profile(){return profile;},async login(email,password){if(!enabled)throw Error('Dịch vụ admin chưa được cấu hình.');clear();save(await api('/auth/v1/token?grant_type=password',{method:'POST',body:{email:email.trim(),password}}));return verify();},verify,
    async logout(){const token=session?.access_token;clear();if(token)try{await api('/auth/v1/logout',{method:'POST',token});}catch{/* Local logout always completes. */}}
  };
}
