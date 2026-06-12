import Link from 'next/link';
import { GraduationCap, ArrowLeft, Scale } from 'lucide-react';
import './aviso-legal.css';

export const metadata = {
  title: 'Aviso Legal | Fundación Exalumnos UCR',
  description: 'Condiciones generales de uso del sitio web de la Fundación Exalumnos de la Universidad de Costa Rica.',
};

export default function AvisoLegalPage() {
  return (
    <div className="aviso-legal-page">
      {/* Header */}
      <header className="aviso-header">
        <div className="aviso-header-inner">
          <Link href="/" className="aviso-back-link">
            <ArrowLeft size={18} />
            <span>Volver al inicio</span>
          </Link>
          <div className="aviso-brand">
            <GraduationCap size={24} />
            <span>Alumni UCR Foundation</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="aviso-hero">
        <div className="aviso-hero-icon">
          <Scale size={48} />
        </div>
        <h1>Aviso Legal</h1>
        <p className="aviso-hero-subtitle">Condiciones generales de uso del sitio web</p>
      </section>

      {/* Content */}
      <main className="aviso-content">
        <article className="aviso-article">

          <section className="aviso-section">
            <p>
              La Universidad de Costa Rica (en adelante UCR) es una institución pública de educación superior dedicada a la docencia, la investigación y la acción social. Como herramienta de apoyo para divulgar las actividades, los servicios y el quehacer universitario, la UCR pone a disposición de los usuarios de internet el sitio web institucional www.ucr.ac.cr, del cual es titular.
            </p>
            <p>
              El acceso y el uso de este portal se rige según las presentes Condiciones generales. La UCR se reserva el derecho de modificar en cualquier momento, y sin necesidad de previo aviso, estas condiciones.
            </p>
          </section>

          <section className="aviso-section">
            <h2>Usuarios</h2>
            <p>
              El acceso y/o el uso del sitio web de la UCR atribuye la condición de usuario (usuarios, en general) del portal e implica y expresa la completa aceptación de las Condiciones generales publicadas en este documento. Es decir, desde el momento en que ingresa y utiliza el portal de la UCR, el usuario acepta navegar por el sitio web y acceder a los contenidos de acuerdo con lo expuesto en este documento. Por tanto, los usuarios son responsables de leer y conocer las condiciones generales cada vez que se dispongan a utilizar el sitio web institucional.
            </p>
          </section>

          <section className="aviso-section">
            <h2>Carácter y límites</h2>
            <p>
              El contenido del sitio web de la UCR es principalmente informativo, su propósito es divulgar las actividades, el trabajo, la historia y los servicios que ofrece la Universidad. Esta información no establece ningún vínculo legal u oficial entre la UCR y otras entidades o personas. Tampoco sustituye, bajo ninguna circunstancia, la normativa, lineamientos administrativos u otras disposiciones que se publican en La Gaceta Universitaria, boletines u otros medios que la UCR determine.
            </p>
          </section>

          <section className="aviso-section">
            <h2>Modificaciones</h2>
            <p>
              La UCR se reserva el derecho de actualizar y modificar su sitio web cada vez que lo crea conveniente y sin necesidad de previo aviso. Estas modificaciones podrán consistir, entre otras, en la incorporación, alteración o supresión de cualquier contenido, estructura, diseño o elemento similar.
            </p>
          </section>

          <section className="aviso-section">
            <h2>Términos de uso del sitio web</h2>
            <p>El acceso y uso del sitio web de la UCR es voluntario y gratuito.</p>
            <p>
              El usuario está obligado a utilizar el portal de forma lícita, ética, legal, conforme a la buena fe y al orden público, y según las presentes condiciones generales.
            </p>
            <p>
              En ningún caso y bajo ninguna circunstancia el usuario podrá emplear el sitio web para fines ilegales, ilícitos, comerciales, perjudiciales para el portal de la UCR y su contenido, dañinos para terceros y/o nocivos para la imagen de la UCR, etc.
            </p>
            <p>
              En cuanto a las opiniones que pueden realizar los usuarios en la sección de comentarios, el usuario se compromete a no emitir comentarios ofensivos que irrespeten o atenten contra la dignidad de las personas.
            </p>
            <p>
              Los usuarios también deben abstenerse de utilizar el espacio de comentarios para fines proselitistas, comerciales u otros que no se relacionen con la actividad académica.
            </p>
            <p>
              La UCR se reserva el derecho de eliminar en cualquier momento y sin previo aviso los comentarios que, a su juicio, irrespeten o atenten, de algún modo, contra la dignidad de las personas.
            </p>
            <p>
              En todo caso, la UCR no es responsable de las opiniones que los usuarios publican en el sitio web de la UCR.
            </p>
          </section>

          <section className="aviso-section">
            <h2>Propiedad intelectual e industrial</h2>
            <p>
              La UCR es titular de los derechos de propiedad intelectual e industrial del sitio web www.ucr.ac.cr, esto incluye el contenido textual, gráfico y audiovisual del portal (por ejemplo: imágenes, sonidos, video, software, códigos, paleta de colores, estructura, diseño, ilustraciones, etc.). En ocasiones, de ser necesario, este sitio usará elementos que son propiedad de terceros que han autorizado su uso a la UCR o cuyo uso está implícitamente permitido a la UCR.
            </p>
            <p>
              El contenido de este portal está protegido por la legislación de la propiedad intelectual e industrial y los tratados internacionales correspondientes.
            </p>
          </section>

          <section className="aviso-section">
            <h2>Imágenes de personas</h2>
            <p>
              Las fotografías o imágenes de personas que aparecen en este sitio web son publicadas con fines estrictamente ilustrativos, con el objetivo de desarrollar materiales visuales que informen e ilustren acerca de la vida y el quehacer universitario de la UCR. En ningún caso se utilizarán con otros fines ni serán cedidas a terceras personas sin la autorización respectiva.
            </p>
          </section>

          <section className="aviso-section">
            <h2>Redes sociales y enlaces</h2>
            <p>
              El sitio web de la UCR ofrece enlaces o hipervínculos a sus redes oficiales (Facebook, Twitter, Youtube, Instagram). Cuando el usuario accede a alguno de estos canales, queda sometido a las políticas que posee cada sitio web.
            </p>
            <p>
              Cuando el presente portal ofrece enlaces a otros sitios de internet, el único objetivo es facilitar el acceso a la información, en ningún caso significa o implica la aprobación o el apoyo de la UCR al contenido o a la persona o entidad dueña y/o responsable del sitio. Tampoco significa ni implica una asociación entre la UCR y la entidad del otro sitio web. Ni los enlaces ni los sitios externos son propiedad de la Institución, motivo por el cual la UCR no se hace responsable por su contenido, por los servicios o productos que ofrezcan, ni por las políticas de privacidad o las prácticas que implementen en el uso y divulgación de la información que recolecten.
            </p>
          </section>

          <section className="aviso-section">
            <h2>Privacidad</h2>
            <p>
              Para algunas funcionalidades, el sitio web solicita información al usuario a través de formularios. Al completarlos, el usuario otorga su consentimiento para que los datos que suministró sean utilizados con la finalidad establecida en el mismo formulario. Al realizar comentarios en el sitio, el usuario acepta implícitamente la publicación de su nombre y de la hora en que se emitió junto al comentario realizado, pero no será divulgado su correo electrónico. Cualquier otro dato que el usuario proporcione será utilizado en apego a lo establecido por la legislación costarricense en materia de protección de datos personales, y no será divulgado sin el consentimiento del titular.
            </p>
            <p>
              En ocasiones, el presente sitio web podría recolectar datos de transmisión de la conexión del usuario que ingresa al sitio. Por ejemplo, datos como el tipo de dispositivo que se usó para ingresar al portal, esta información se utiliza para adaptar el contenido al dispositivo. En todo caso, la información que se recolecta es con el fin de darle una mejor experiencia al usuario.
            </p>
            <p>
              Asimismo, el sitio web de la UCR utiliza cookies para almacenar información de sesión y preferencias de accesibilidad del usuario. Estos datos se utilizan únicamente con el fin de mejorar la experiencia del usuario mientras navega por el sitio web de la UCR.
            </p>
            <p>
              En ningún caso el contenido almacenado en los cookies u otro tipo de información sobre el acceso se distribuye a terceros.
            </p>
          </section>

          <section className="aviso-section">
            <h2>Accesibilidad</h2>
            <p>
              En la UCR trabajamos constantemente para mejorar la experiencia del usuario del presente sitio web en términos de accesibilidad visual, auditiva, motora y cognitiva. Para esto, se utilizan distintas herramientas automáticas y de intervención humana que evalúan el cumplimiento de los parámetros de accesibilidad.
            </p>
            <p>
              La correspondencia con los criterios de accesibilidad es un requerimiento principal de desarrollo cada vez que se realizan actualizaciones de este sitio web.
            </p>
            <p>
              En caso de que los usuarios experimenten alguna dificultad de accesibilidad en el sitio web y requieran asistencia, pueden contactarse con los encargados de este portal por medio del correo electrónico <a href="mailto:consultas.odi@ucr.ac.cr" className="aviso-email-link">consultas.odi@ucr.ac.cr</a>
            </p>
          </section>

        </article>
      </main>

      {/* Footer */}
      <footer className="aviso-footer">
        <p>&copy; {new Date().getFullYear()} Fundación Exalumnos UCR. Todos los derechos reservados.</p>
        <div className="aviso-footer-links">
          <Link href="/privacidad">Privacidad</Link>
          <Link href="/">Inicio</Link>
        </div>
      </footer>
    </div>
  );
}
