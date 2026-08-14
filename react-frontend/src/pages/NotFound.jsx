import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-app flex flex-col items-center justify-center py-24 text-center">
      <span className="text-7xl font-black text-brand-600">404</span>
      <h1 className="mt-4 text-2xl font-black text-gray-900">Page not found</h1>
      <p className="mt-2 text-sm text-gray-500">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button to="/" variant="primary" className="mt-8">
        <i className="fa-solid fa-house mr-1" aria-hidden="true" /> Back to Home
      </Button>
      <Link to="/shop" className="mt-4 text-sm font-semibold text-brand-600 hover:underline">
        Browse the shop instead
      </Link>
    </div>
  );
}
