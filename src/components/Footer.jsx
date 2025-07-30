export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm md:text-base">
          &copy; {new Date().getFullYear()} Livrini. Tous droits réservés.
        </p>
        <div className="mt-2 flex justify-center space-x-6">
          <a href="#" className="text-gray-300 hover:text-white">
            Mentions légales
          </a>
          <a href="#" className="text-gray-300 hover:text-white">
            Politique de confidentialité
          </a>
          <a href="#" className="text-gray-300 hover:text-white">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}