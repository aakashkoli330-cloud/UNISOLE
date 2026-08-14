import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { productsApi } from "../../api/products";
import Logo from "../ui/Logo";
import { getImageSrc } from "../../utils/getImageSrc";
import { formatPrice } from "../../utils/format";

const navLinkClass = ({ isActive }) =>
  `relative text-sm font-semibold transition-colors hover:text-brand-600 ${
    isActive ? "text-brand-600" : "text-gray-700"
  }`;

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setSearchOpen(false);
      return;
    }

    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await productsApi.search(query.trim());
        setResults(data || []);
        setSearchOpen(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(t);
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchOpen(false);
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  const goTo = (path) => {
    setMenuOpen(false);
    setSearchOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    goTo("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/shop?category=men" className={navLinkClass}>
            Men
          </NavLink>
          <NavLink to="/shop?category=women" className={navLinkClass}>
            Women
          </NavLink>
          <NavLink to="/orders" className={navLinkClass}>
            Orders
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <div ref={searchRef} className="relative hidden sm:block">
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => results.length > 0 && setSearchOpen(true)}
                placeholder="Search shoes..."
                className="input w-56 !py-2 pl-9 pr-3"
              />
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400" />
            </form>

            {searchOpen && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-card-hover">
                {searching ? (
                  <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
                ) : results.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No products found
                  </div>
                ) : (
                  results.map((p) => (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => goTo(`/products/${p._id}`)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                    >
                      <img
                        src={getImageSrc(p.image)}
                        alt={p.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-gray-900">
                          {p.name}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {p.category} · {formatPrice(p.price)}
                        </span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => goTo("/cart")}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 hover:text-brand-600"
            aria-label="Cart"
          >
            <i className="fa-solid fa-bag-shopping text-lg" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>

          {user ? (
            <div className="hidden md:flex items-center gap-3">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-sm font-semibold text-gray-700 transition-colors hover:text-brand-600"
                >
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={() => goTo("/profile")}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 transition-colors hover:bg-brand-200"
                aria-label="Profile"
              >
                {user.name?.charAt(0)?.toUpperCase() || <i className="fa-solid fa-user" />}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-semibold text-gray-500 transition-colors hover:text-red-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn-secondary hidden !px-4 !py-2 text-sm md:inline-flex"
            >
              Login
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 md:hidden"
            aria-label="Menu"
          >
            <i className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"} text-lg`} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <nav className="container-app flex flex-col py-2">
            <NavLink
              to="/"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              Home
            </NavLink>
            <NavLink
              to="/shop?category=men"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              Men
            </NavLink>
            <NavLink
              to="/shop?category=women"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              Women
            </NavLink>
            <NavLink
              to="/orders"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              Orders
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                Admin
              </NavLink>
            )}
            {user ? (
              <>
                <NavLink
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  Profile
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-brand-600 hover:bg-brand-50"
              >
                Login / Register
              </NavLink>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
