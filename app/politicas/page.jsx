export const metadata = {
  title: 'Política de Privacidad - Sortea2',
  description: 'Política de Privacidad de la app Sortea2',
};

export default function PoliticasPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 prose">
      <h1>Política de Privacidad</h1>
      <p>Última actualización: {new Date().toISOString().slice(0,10)}</p>

      <h2>Quiénes somos</h2>
      <p>
        Sortea2 es una aplicación que permite gestionar sorteos utilizando datos
        provistos por Meta (Facebook). Contacto: <a href="mailto:sortean.22@gmail.com">sortean.22@gmail.com</a>.
      </p>

      <h2>Datos que recopilamos</h2>
      <ul>
        <li>Nombre e ID de cuenta de Facebook del usuario que conecta.</li>
        <li>Información de Páginas administradas (ID, nombre) y tokens de acceso.</li>
        <li>Contenido público necesario para el sorteo (p. ej., comentarios en publicaciones).</li>
      </ul>

      <h2>Para qué usamos los datos</h2>
      <ul>
        <li>Autenticar usuarios mediante Facebook Login.</li>
        <li>Listar Páginas y leer comentarios de publicaciones para ejecutar la tómbola.</li>
        <li>Mejorar la seguridad y funcionamiento del servicio.</li>
      </ul>

      <h2>Base legal</h2>
      <p>Consentimiento del usuario y cumplimiento de Términos y Políticas de Meta.</p>

      <h2>Conservación</h2>
      <p>Conservamos los datos mientras mantengas la conexión con tu cuenta y/o Página.
        Puedes revocar el acceso en cualquier momento.</p>

      <h2>Compartición</h2>
      <p>No vendemos datos. Solo usamos servicios de terceros necesarios (p. ej., alojamiento)
        que cumplen medidas de seguridad adecuadas.</p>

      <h2>Tus derechos</h2>
      <p>Puedes solicitar acceso o eliminación de tus datos. Contáctanos en
        <a href="mailto:sortean.22@gmail.com"> sortean.22@gmail.com</a>.</p>

      <h2>Eliminación de datos</h2>
      <p>
        Puedes solicitar la eliminación mediante nuestra URL de eliminación:
        <code> /api/meta/data-deletion?user_id=TU_ID</code>. También puedes revocar permisos desde
        <a href="https://www.facebook.com/settings?tab=applications"> Facebook</a>.
      </p>

      <h2>Cambios</h2>
      <p>Podemos actualizar esta Política. Publicaremos la versión vigente en esta misma URL.</p>
    </main>
  );
}
