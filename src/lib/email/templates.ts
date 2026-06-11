export function getDonacionConfirmadaTemplate(nombreEstudiante: string, monto: number, moneda: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #003366;">¡Tu donación ha sido confirmada!</h2>
      <p>Hola <strong>${nombreEstudiante}</strong>,</p>
      <p>Nos alegra informarte que hemos validado exitosamente una donación destinada a tu proyecto.</p>
      <p style="font-size: 18px; padding: 15px; background-color: #f0f7fa; border-left: 4px solid #003366;">
        <strong>Monto confirmado:</strong> ${monto} ${moneda}
      </p>
      <p>Este aporte es un gran paso para el desarrollo de tus estudios y tu proyecto académico.</p>
      <br />
      <p>Saludos cordiales,<br><strong>El equipo de la Fundación Exalumnos UCR</strong></p>
    </div>
  `;
}

export function getNuevaAplicacionTemplate(nombreExalumno: string, tituloPosicion: string, nombreEstudiante: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #003366;">Nueva Aplicación Recibida</h2>
      <p>Hola <strong>${nombreExalumno}</strong>,</p>
      <p>El estudiante <strong>${nombreEstudiante}</strong> acaba de aplicar a tu vacante/proyecto: <em>${tituloPosicion}</em>.</p>
      <p>Por favor, ingresa a la plataforma para revisar su currículum y detalles de contacto.</p>
      <br />
      <p>Saludos cordiales,<br><strong>El equipo de la Fundación Exalumnos UCR</strong></p>
    </div>
  `;
}

export function getNuevoMatchTemplate(nombreUsuario: string, tipoMatch: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #003366;">¡Nuevo Match Sugerido!</h2>
      <p>Hola <strong>${nombreUsuario}</strong>,</p>
      <p>Hemos encontrado un perfil con gran compatibilidad para el área de <strong>${tipoMatch}</strong>.</p>
      <p>Ingresa a tu panel en la plataforma para revisar los detalles y contactar a tu nuevo match.</p>
      <br />
      <p>Saludos cordiales,<br><strong>El equipo de la Fundación Exalumnos UCR</strong></p>
    </div>
  `;
}

export function getAlertaSuspensionTemplate(nombreAdmin: string, emailReportado: string, cantidadReportes: number) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #990000;">⚠️ Alerta de Suspensión Automática</h2>
      <p>Hola <strong>${nombreAdmin}</strong>,</p>
      <p>El sistema ha suspendido temporalmente la cuenta del usuario: <strong>${emailReportado}</strong>.</p>
      <p>Motivo: Ha recibido <strong>${cantidadReportes} reportes</strong> por parte de otros usuarios.</p>
      <p>Por favor, ingresa al panel administrativo para revisar los reportes y tomar una decisión definitiva sobre este perfil.</p>
      <br />
      <p>Saludos cordiales,<br><strong>Sistema de Fundación Exalumnos UCR</strong></p>
    </div>
  `;
}

export function getRecordatorioDonacionTemplate(nombreAdmin: string, monto: number, moneda: string, emailExalumno: string, fechaTransferencia: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #ff9900;">⏳ Recordatorio: Donación Pendiente (> 48h)</h2>
      <p>Hola <strong>${nombreAdmin}</strong>,</p>
      <p>Una donación requiere tu atención urgente. Han pasado más de 48 horas sin ser confirmada o rechazada.</p>
      <ul>
        <li><strong>Donante:</strong> ${emailExalumno}</li>
        <li><strong>Monto:</strong> ${monto} ${moneda}</li>
        <li><strong>Fecha de Transferencia:</strong> ${new Date(fechaTransferencia).toLocaleDateString('es-CR')}</li>
      </ul>
      <p>Por favor, ingresa al panel de donaciones para revisar el comprobante.</p>
      <br />
      <p>Saludos cordiales,<br><strong>Sistema de Fundación Exalumnos UCR</strong></p>
    </div>
  `;
}

export function getAlertaMatchAntiguoTemplate(nombreAdmin: string, emailExalumno: string, emailEstudiante: string, fechaCreacion: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #003366;">🗓️ Seguimiento de Match Activo</h2>
      <p>Hola <strong>${nombreAdmin}</strong>,</p>
      <p>El siguiente match ha estado en estado "activo" por más de 6 meses y requiere seguimiento:</p>
      <ul>
        <li><strong>Exalumno:</strong> ${emailExalumno}</li>
        <li><strong>Estudiante:</strong> ${emailEstudiante}</li>
        <li><strong>Activo desde:</strong> ${new Date(fechaCreacion).toLocaleDateString('es-CR')}</li>
      </ul>
      <p>Es recomendable contactar a las partes para conocer si el apoyo finalizó exitosamente o sigue en curso.</p>
      <br />
      <p>Saludos cordiales,<br><strong>Sistema de Fundación Exalumnos UCR</strong></p>
    </div>
  `;
}
export function getNuevaDonacionAdminTemplate(monto: number, moneda: string, proyecto: string, metodo: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #003366;">Nueva Donación Registrada</h2>
      <p>Hola <strong>Administrador</strong>,</p>
      <p>Se ha registrado una nueva donación en la plataforma que requiere revisión.</p>
      <p style="font-size: 16px; padding: 15px; background-color: #f0f7fa; border-left: 4px solid #003366;">
        <strong>Monto:</strong> ${monto} ${moneda}<br/>
        <strong>Destino:</strong> ${proyecto}<br/>
        <strong>Método de pago:</strong> ${metodo}
      </p>
      <p>Por favor, ingresa al panel de administración para validar el comprobante de pago.</p>
      <br />
      <p>Saludos cordiales,<br><strong>Sistema de Fundación Exalumnos UCR</strong></p>
    </div>
  `;
}

export function getEstadoDonacionTemplate(nombreExalumno: string, estado: string, monto: number, moneda: string, motivoRechazo?: string) {
  const isConfirmada = estado === 'confirmada';
  const color = isConfirmada ? '#10b981' : '#ef4444';
  const titulo = isConfirmada ? '¡Tu donación ha sido confirmada!' : 'Actualización sobre tu donación';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: ${color};">${titulo}</h2>
      <p>Hola <strong>${nombreExalumno}</strong>,</p>
      <p>El estado de tu donación por <strong>${monto} ${moneda}</strong> ha sido actualizado a: <strong>${estado.toUpperCase()}</strong>.</p>
      ${!isConfirmada && motivoRechazo ? `<p style="padding: 10px; background-color: #fee2e2; border-left: 4px solid #ef4444;"><strong>Motivo:</strong> ${motivoRechazo}</p>` : ''}
      ${isConfirmada ? '<p>¡Muchas gracias por tu valioso aporte a la comunidad estudiantil de la UCR!</p>' : '<p>Si tienes alguna duda, por favor contáctanos.</p>'}
      <br />
      <p>Saludos cordiales,<br><strong>El equipo de la Fundación Exalumnos UCR</strong></p>
    </div>
  `;
}
