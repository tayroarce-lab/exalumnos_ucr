"use strict";(()=>{var e={};e.id=761,e.ids=[761],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},1212:e=>{e.exports=require("async_hooks")},4770:e=>{e.exports=require("crypto")},6162:e=>{e.exports=require("stream")},1764:e=>{e.exports=require("util")},4492:e=>{e.exports=require("node:stream")},8980:(e,r,o)=>{o.r(r),o.d(r,{originalPathname:()=>f,patchFetch:()=>g,requestAsyncStorage:()=>p,routeModule:()=>l,serverHooks:()=>h,staticGenerationAsyncStorage:()=>m});var n={};o.r(n),o.d(n,{GET:()=>d});var t=o(9303),a=o(8716),s=o(670),i=o(7070),c=o(9658),u=o(7270);async function d(e){if(e.headers.get("authorization")!==`Bearer ${process.env.CRON_SECRET}`)return i.NextResponse.json({error:"Unauthorized"},{status:401});try{let e=(0,c.i)(),r=new Date(Date.now()-1728e5).toISOString(),{data:o,error:n}=await e.from("donaciones").select(`
        id, 
        monto, 
        moneda, 
        fecha_transferencia, 
        donante:users!donaciones_exalumno_id_fkey(email)
      `).eq("estado","pendiente").lt("created_at",r);if(n)throw n;if(o&&o.length>0){let{data:r}=await e.from("users").select("email").eq("tipo","admin").eq("activo",!0);if(r&&r.length>0){let e=r.map(e=>e.email);for(let r of o){let o=Array.isArray(r.donante)?r.donante[0]:r.donante;o&&o.email&&await (0,u.B)(e,"Equipo Administrador",r.monto,r.moneda,o.email,r.fecha_transferencia)}}}return i.NextResponse.json({success:!0,message:`Se enviaron notificaciones para ${o?.length||0} donaciones atrasadas.`})}catch(e){return console.error("Error en cron check-donations:",e),i.NextResponse.json({error:e.message},{status:500})}}let l=new t.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/cron/check-donations/route",pathname:"/api/cron/check-donations",filename:"route",bundlePath:"app/api/cron/check-donations/route"},resolvedPagePath:"C:\\Users\\Pcfwd\\OneDrive\\Escritorio\\BACKEND\\proyectos\\exalumnos_ucr\\exalumnos_ucr\\src\\app\\api\\cron\\check-donations\\route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:p,staticGenerationAsyncStorage:m,serverHooks:h}=l,f="/api/cron/check-donations/route";function g(){return(0,s.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:m})}},7270:(e,r,o)=>{o.d(r,{B:()=>a,Gd:()=>s});let n=new(o(6495)).R(process.env.RESEND_API_KEY);async function t({to:e,subject:r,html:o}){try{let t=await n.emails.send({from:`Fundaci\xf3n Exalumnos UCR <onboarding@resend.dev>`,to:e,subject:r,html:o});return{success:!0,data:t}}catch(e){return console.error("Error enviando email:",e),{success:!1,error:e}}}async function a(e,r,o,n,a,s){return t({to:e,subject:"⏳ Acci\xf3n requerida: Donaci\xf3n pendiente por m\xe1s de 48h",html:`
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #ff9900;">⏳ Recordatorio: Donaci\xf3n Pendiente (> 48h)</h2>
      <p>Hola <strong>${r}</strong>,</p>
      <p>Una donaci\xf3n requiere tu atenci\xf3n urgente. Han pasado m\xe1s de 48 horas sin ser confirmada o rechazada.</p>
      <ul>
        <li><strong>Donante:</strong> ${a}</li>
        <li><strong>Monto:</strong> ${o} ${n}</li>
        <li><strong>Fecha de Transferencia:</strong> ${new Date(s).toLocaleDateString("es-CR")}</li>
      </ul>
      <p>Por favor, ingresa al panel de donaciones para revisar el comprobante.</p>
      <br />
      <p>Saludos cordiales,<br><strong>Sistema de Fundaci\xf3n Exalumnos UCR</strong></p>
    </div>
  `})}async function s(e,r,o,n,a){return t({to:e,subject:"\uD83D\uDDD3️ Seguimiento requerido: Match activo por m\xe1s de 6 meses",html:`
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #003366;">🗓️ Seguimiento de Match Activo</h2>
      <p>Hola <strong>${r}</strong>,</p>
      <p>El siguiente match ha estado en estado "activo" por m\xe1s de 6 meses y requiere seguimiento:</p>
      <ul>
        <li><strong>Exalumno:</strong> ${o}</li>
        <li><strong>Estudiante:</strong> ${n}</li>
        <li><strong>Activo desde:</strong> ${new Date(a).toLocaleDateString("es-CR")}</li>
      </ul>
      <p>Es recomendable contactar a las partes para conocer si el apoyo finaliz\xf3 exitosamente o sigue en curso.</p>
      <br />
      <p>Saludos cordiales,<br><strong>Sistema de Fundaci\xf3n Exalumnos UCR</strong></p>
    </div>
  `})}},9658:(e,r,o)=>{o.d(r,{i:()=>t});var n=o(3370);function t(){if(!process.env.SUPABASE_SERVICE_ROLE_KEY)throw Error("Falta SUPABASE_SERVICE_ROLE_KEY");return(0,n.eI)("https://vzcjppbvmbhcnrempuxf.supabase.co",process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:!1,persistSession:!1}})}}};var r=require("../../../../webpack-runtime.js");r.C(e);var o=e=>r(r.s=e),n=r.X(0,[369,495],()=>o(8980));module.exports=n})();