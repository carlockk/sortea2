export const metadata = {
  title: "Eliminación de datos de usuario - Sortea2",
  description: "Solicitud de eliminación de datos de usuario en Sortea2",
};

export default function DeleteDataPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 prose">
      <h1>Eliminación de datos de usuario</h1>

      <p>
        Esta aplicación permite a los usuarios realizar sorteos en base a
        publicaciones y comentarios de Instagram, siempre con autorización
        previa del usuario.
      </p>

      <p>
        Los usuarios pueden solicitar la eliminación de sus datos personales en
        cualquier momento.
      </p>

      <p>
        Para solicitar la eliminación de los datos asociados a esta aplicación,
        el usuario debe enviar un correo electrónico a:
      </p>

      <p>sortean.22@gmail.com</p>

      <p>En el mensaje debe indicar:</p>

      <ul>
        <li>Nombre de usuario de Instagram utilizado en la aplicación</li>
        <li>Correo electrónico de contacto</li>
      </ul>

      <p>
        Una vez recibida la solicitud, los datos serán eliminados de nuestros
        sistemas en un plazo máximo de 30 días.
      </p>

      <p>
        Si el usuario ya no utiliza la aplicación, también puede revocar el
        acceso desde la configuración de su cuenta de Facebook o Instagram.
      </p>
    </main>
  );
}
