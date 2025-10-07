export default function Footer() {
  return (
    <footer className="mt-auto border-t bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <p>
          © {new Date().getFullYear()} AI-SaaS. Todos los derechos reservados.
        </p>
        <div className="mt-3 md:mt-0 flex gap-4">
          <a href="#" className="hover:text-blue-600 transition">
            Privacidad
          </a>
          <a href="#" className="hover:text-blue-600 transition">
            Términos
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            className="hover:text-blue-600 transition"
          >
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
