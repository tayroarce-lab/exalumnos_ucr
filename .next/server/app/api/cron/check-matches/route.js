"use strict";(()=>{var e={};e.id=166,e.ids=[166],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},1212:e=>{e.exports=require("async_hooks")},4770:e=>{e.exports=require("crypto")},6162:e=>{e.exports=require("stream")},1764:e=>{e.exports=require("util")},4492:e=>{e.exports=require("node:stream")},456:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>g,patchFetch:()=>f,requestAsyncStorage:()=>p,routeModule:()=>d,serverHooks:()=>h,staticGenerationAsyncStorage:()=>m});var a={};t.r(a),t.d(a,{GET:()=>l});var o=t(9303),s=t(8716),n=t(670),i=t(7070),c=t(9658),u=t(7270);async function l(e){if(e.headers.get("authorization")!==`Bearer ${process.env.CRON_SECRET}`)return i.NextResponse.json({error:"Unauthorized"},{status:401});try{let e=(0,c.i)(),r=new Date(Date.now()-15552e6).toISOString(),{data:t,error:a}=await e.from("matches").select(`
        id, 
        created_at,
        exalumno:users!matches_exalumno_id_fkey(email),
        estudiante:users!matches_estudiante_id_fkey(email)
      `).eq("estado","activo").lt("created_at",r);if(a)throw a;if(t&&t.length>0){let{data:r}=await e.from("users").select("email").eq("tipo","admin").eq("activo",!0);if(r&&r.length>0){let e=r.map(e=>e.email);for(let r of t){let t=Array.isArray(r.exalumno)?r.exalumno[0]:r.exalumno,a=Array.isArray(r.estudiante)?r.estudiante[0]:r.estudiante;t?.email&&a?.email&&await (0,u.Gd)(e,"Equipo Administrador",t.email,a.email,r.created_at)}}}return i.NextResponse.json({success:!0,message:`Se enviaron alertas para ${t?.length||0} matches antiguos.`})}catch(e){return console.error("Error en cron check-matches:",e),i.NextResponse.json({error:e.message},{status:500})}}let d=new o.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/cron/check-matches/route",pathname:"/api/cron/check-matches",filename:"route",bundlePath:"app/api/cron/check-matches/route"},resolvedPagePath:"C:\\Users\\Pcfwd\\OneDrive\\Escritorio\\BACKEND\\proyectos\\exalumnos_ucr\\exalumnos_ucr\\src\\app\\api\\cron\\check-matches\\route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:p,staticGenerationAsyncStorage:m,serverHooks:h}=d,g="/api/cron/check-matches/route";function f(){return(0,n.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:m})}},7270:(e,r,t)=>{t.d(r,{B:()=>s,Gd:()=>n});let a=new(t(6495)).R(process.env.RESEND_API_KEY);async function o({to:e,subject:r,html:t}){try{let o=await a.emails.send({from:`Fundaci\xf3n Exalumnos UCR <onboarding@resend.dev>`,to:e,subject:r,html:t});return{success:!0,data:o}}catch(e){return console.error("Error enviando email:",e),{success:!1,error:e}}}async function s(e,r,t,a,s,n){return o({to:e,subject:"⏳ Acci\xf3n requerida: Donaci\xf3n pendiente por m\xe1s de 48h",html:`
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #ff9900;">⏳ Recordatorio: Donaci\xf3n Pendiente (> 48h)</h2>
      <p>Hola <strong>${r}</strong>,</p>
      <p>Una donaci\xf3n requiere tu atenci\xf3n urgente. Han pasado m\xe1s de 48 horas sin ser confirmada o rechazada.</p>
      <ul>
        <li><strong>Donante:</strong> ${s}</li>
        <li><strong>Monto:</strong> ${t} ${a}</li>
        <li><strong>Fecha de Transferencia:</strong> ${new Date(n).toLocaleDateString("es-CR")}</li>
      </ul>
      <p>Por favor, ingresa al panel de donaciones para revisar el comprobante.</p>
      <br />
      <p>Saludos cordiales,<br><strong>Sistema de Fundaci\xf3n Exalumnos UCR</strong></p>
    </div>
  `})}async function n(e,r,t,a,s){return o({to:e,subject:"\uD83D\uDDD3️ Seguimiento requerido: Match activo por m\xe1s de 6 meses",html:`
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #003366;">🗓️ Seguimiento de Match Activo</h2>
      <p>Hola <strong>${r}</strong>,</p>
      <p>El siguiente match ha estado en estado "activo" por m\xe1s de 6 meses y requiere seguimiento:</p>
      <ul>
        <li><strong>Exalumno:</strong> ${t}</li>
        <li><strong>Estudiante:</strong> ${a}</li>
        <li><strong>Activo desde:</strong> ${new Date(s).toLocaleDateString("es-CR")}</li>
      </ul>
      <p>Es recomendable contactar a las partes para conocer si el apoyo finaliz\xf3 exitosamente o sigue en curso.</p>
      <br />
      <p>Saludos cordiales,<br><strong>Sistema de Fundaci\xf3n Exalumnos UCR</strong></p>
    </div>
  `})}},9658:(e,r,t)=>{t.d(r,{i:()=>o});var a=t(3370);function o(){if(!process.env.SUPABASE_SERVICE_ROLE_KEY)throw Error("Falta SUPABASE_SERVICE_ROLE_KEY");return(0,a.eI)("https://vzcjppbvmbhcnrempuxf.supabase.co",process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:!1,persistSession:!1}})}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),a=r.X(0,[369,495],()=>t(456));module.exports=a})();