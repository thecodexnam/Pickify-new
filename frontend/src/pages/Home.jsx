import React from "react";
import { useSelector } from "react-redux";
import UserDashboard from "../components/UserDashboard";
import OwnerDashboard from "../components/OwnerDashboard";
import DeliveryBoy from "../components/DeliveryBoy";
import AdminDashboard from "./AdminDashboard";

function Home() {
  const { userData } = useSelector((state) => state.user);
  return (
    <div className="w-full min-h-screen">
      {userData.role == "user" && <UserDashboard />}
      {userData.role == "owner" && <OwnerDashboard />}
      {userData.role == "deliveryBoy" && <DeliveryBoy />}
      {userData.role == "admin" && <AdminDashboard />}
    </div>
  );
}

export default Home;
