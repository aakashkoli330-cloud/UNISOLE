const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export const API_BASE_URL = isLocal ? "/api" : "https://unisole.onrender.com/api";

export const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/dfd8f0jha/image/upload";

export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='400'%20height='400'%3E%3Crect%20width='400'%20height='400'%20fill='%23f3f4f6'/%3E%3Ctext%20x='50%25'%20y='50%25'%20fill='%239ca3af'%20font-family='sans-serif'%20font-size='20'%20text-anchor='middle'%20dominant-baseline='middle'%3EUNISOLE%3C/text%3E%3C/svg%3E";

export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SbQBaTenDLPSMr";

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "536359177570-1cdaq9fajio2hhb6do6ige2o5i2l25gm.apps.googleusercontent.com";

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
];
