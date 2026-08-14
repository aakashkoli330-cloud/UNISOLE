import { Link } from "react-router-dom";
import Logo from "../ui/Logo";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 bg-white">
      <div className="container-app py-12">
        <div className="flex flex-col items-center gap-6 text-center">
          <Link to="/" className="flex items-center">
            <Logo size="sm" />
          </Link>
          <p className="text-sm text-gray-500">Designed for Motion</p>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-gray-600">
            <Link to="/" className="transition-colors hover:text-brand-600">
              Home
            </Link>
            <Link to="/shop?category=men" className="transition-colors hover:text-brand-600">
              Men
            </Link>
            <Link to="/shop?category=women" className="transition-colors hover:text-brand-600">
              Women
            </Link>
            <Link to="/orders" className="transition-colors hover:text-brand-600">
              Orders
            </Link>
            <Link to="/cart" className="transition-colors hover:text-brand-600">
              Cart
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="#"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-brand-600 hover:text-white"
            >
              <i className="fab fa-instagram" aria-hidden="true" />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-brand-600 hover:text-white"
            >
              <i className="fab fa-twitter" aria-hidden="true" />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-brand-600 hover:text-white"
            >
              <i className="fab fa-facebook-f" aria-hidden="true" />
            </a>
            <a
              href="https://github.com/aakashkoli330-cloud"
              aria-label="GitHub"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-900 hover:text-white"
            >
              <i className="fab fa-github" aria-hidden="true" />
            </a>
          </div>

          <div className="h-px w-full max-w-md bg-gray-100" />

          <div className="space-y-1 text-sm text-gray-500">
            <p>© 2026 UNISOLE — Designed for Motion</p>
            <p>
              Contact us -{" "}
              <a
                href="mailto:unisole.store@gmail.com"
                className="text-brand-600 hover:underline"
              >
                unisole.store@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
