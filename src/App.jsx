import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomerApp from "./CustomerApp";
import OwnerLogin from "./pages/owner/OwnerLogin";
import OwnerHome from "./pages/owner/OwnerHome";
import OwnerOrders from "./pages/owner/OwnerOrders";
import OwnerLayout from "./components/owner/OwnerLayout";
import ProtectedRoute from "./components/owner/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerApp />} />
        <Route path="/owner/login" element={<OwnerLogin />} />
        <Route
          path="/owner"
          element={
            <ProtectedRoute>
              <OwnerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OwnerHome />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
