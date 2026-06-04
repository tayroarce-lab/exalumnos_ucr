'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PropiedadesContenedor {
  children: React.ReactNode;
}

export default function ProtectedContainer({ children }: PropiedadesContenedor) {
  const enrutador = useRouter();
  const [estaAutorizado, establecerAutorizado] = useState(false);

  useEffect(() => {
    // Aquí va tu lógica real de verificación de cliente
    const usuarioValido = true;

    if (!usuarioValido) {
      // Redirección imperativa, sin usar etiquetas <form> o <a>
      enrutador.push('/acceso-denegado');
    } else {
      establecerAutorizado(true);
    }
  }, [enrutador]);

  const manejarRedireccionSegura = () => {
    enrutador.push('/panel-control');
  };

  if (!estaAutorizado) return null; // No renderiza nada hasta validar

  return (
    <div className="contenedor-privado">
      <header className="cabecera-privada">
        <button className="boton-navegacion" onClick={manejarRedireccionSegura}>
          Ir al Panel
        </button>
      </header>
      <main className="contenido-privado">
        {children}
      </main>
    </div>
  );
}
