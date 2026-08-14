import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const itemClass = ({ isActive }) =>
  `flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-semibold transition-colors ${
    isActive ? "text-brand-600" : "text-gray-400"
  }`;

export default function BottomNav() {
  const { user } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-100 bg-white/95 backdrop-blur md:hidden">
      <div className="flex">
        <NavLink to="/" end className={itemClass}>
          <i className="fa-solid fa-home text-lg" aria-hidden="true" />
          <span>Home</span>
        </NavLink>
        <NavLink to="/shop?category=men" className={itemClass}>
          <i className="fa-solid fa-person text-lg" aria-hidden="true" />
          <span>Men</span>
        </NavLink>
        <NavLink to="/shop?category=women" className={itemClass}>
          <i className="fa-solid fa-person-dress text-lg" aria-hidden="true" />
          <span>Women</span>
        </NavLink>
        <button
          type="button"
          onClick={() => navigate("/cart")}
          className="relative flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-semibold text-gray-400 transition-colors"
          aria-label="Cart"
        >
          <span className="relative">
            <i className="fa-solid fa-bag-shopping text-lg" aria-hidden="true" />
            {count > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-0.5 text-[9px] font-bold text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </span>
          <span>Cart</span>
        </button>
        <NavLink to={user ? "/profile" : "/login"} className={itemClass}>
          <i className="fa-solid fa-user text-lg" aria-hidden="true" />
          <span>{user ? "Profile" : "Login"}</span>
        </NavLink>
      </div>
    </nav>
  );
}
