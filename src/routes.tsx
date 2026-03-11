import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TrackPage } from "@/pages/track/TrackPage";
import { NavigationPage } from "@/pages/navigation/Navigationpage";
import { DriverPage } from "@/pages/driver/DriverPage";
import { LoginPage } from "@/pages/login/LoginPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { CreateDeliveryPage } from "@/pages/create-delivery/CreateDeliveryPage";
import { DeliveryDetailsPage } from "@/pages/delivery-details-page/DeliveryDetailsPage";
import { PrivateRoute } from "./PrivateRoute";

export function AppRoutes() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Público — sem autenticação */}
        <Route path="/track/:publicCodeClient/:orderCode"           element={<TrackPage />} />
        <Route path="/navegacao/track/:publicCodeClient/:orderCode" element={<NavigationPage />} />
        <Route path="/driver/:publicCodeDeliveryman"                element={<DriverPage />} />
        <Route path="/login"                                        element={<LoginPage />} />

        {/* Autenticado — exige token válido */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard"                      element={<DashboardPage />} />
          <Route path="/dashboard/new"                  element={<CreateDeliveryPage />} />
          <Route path="/dashboard/delivery/:deliveryId" element={<DeliveryDetailsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}