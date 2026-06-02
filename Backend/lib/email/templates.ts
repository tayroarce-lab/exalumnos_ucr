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
