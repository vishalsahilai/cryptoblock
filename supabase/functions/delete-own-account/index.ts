// Only the authenticated password owner can delete their own Supabase identity.
Deno.serve(async (req: Request) => {
 const reply=(body:unknown,status=200)=>Response.json(body,{status});
 if(req.method!=='POST')return reply({error:'Method not allowed'},405);
 const base=Deno.env.get('SUPABASE_URL')!,admin=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,token=req.headers.get('Authorization');
 if(!token?.startsWith('Bearer '))return reply({error:'Authentication required'},401);
 const userResponse=await fetch(base+'/auth/v1/user',{headers:{apikey:admin,Authorization:token}});
 if(!userResponse.ok)return reply({error:'Invalid session'},401);
 const user=await userResponse.json();let b;try{b=await req.json();}catch{return reply({error:'Invalid request'},400);}
 if(b.confirmation!=='DELETE'||typeof b.password!=='string'||b.password.length>128)return reply({error:'Password and DELETE confirmation required'},400);
 const verification=await fetch(base+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:admin,'Content-Type':'application/json'},body:JSON.stringify({email:user.email,password:b.password})});
 if(!verification.ok)return reply({error:'Password verification failed'},403);
 const session=await verification.json();if(session.user?.id!==user.id)return reply({error:'Identity mismatch'},403);
 const headers={apikey:admin,Authorization:'Bearer '+admin};
 const logout=await fetch(base+'/auth/v1/logout?scope=global',{method:'POST',headers:{apikey:admin,Authorization:'Bearer '+session.access_token}});
 if(!logout.ok)return reply({error:'Unable to revoke sessions'},503);
 const removed=await fetch(base+'/auth/v1/admin/users/'+encodeURIComponent(user.id),{method:'DELETE',headers});
 if(!removed.ok)return reply({error:'Identity deletion failed'},503);
 return reply({deleted:true});
});
