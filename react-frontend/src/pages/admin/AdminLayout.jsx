import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
    isActive ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-100"
  }`;

export default function AdminLayout() {
  const { user } = useAuth();

  return (
    <div className="container-app py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Admin Panel</h1>
          <p className="mt-1 text-sm text-gray-500">
            Signed in as {user?.name}
          </p>
        </div>
        <Link to="/" className="btn-secondary text-sm">
          <i className="fa-solid fa-arrow-left mr-1" aria-hidden="true" /> Back to store
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <nav className="flex gap-2 overflow-x-auto rounded-xl border border-gray-100 bg-white p-2 lg:flex-col">
          <NavLink to="/admin" end className={linkClass}>
            <i className="fa-solid fa-chart-line w-4" aria-hidden="true" />
            Dashboard
          </NavLink>
          <NavLink to="/admin/products" className={linkClass}>
            <i className="fa-solid fa-box w-4" aria-hidden="true" />
            Products
          </NavLink>
          <NavLink to="/admin/orders" className={linkClass}>
            <i className="fa-solid fa-receipt w-4" aria-hidden="true" />
            Orders
          </NavLink>
        </nav>

        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
