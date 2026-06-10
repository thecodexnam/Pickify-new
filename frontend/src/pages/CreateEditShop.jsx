import React, { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaStore } from "react-icons/fa6";
import axios from "axios";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners";
import AppFooter from "../components/AppFooter";

function CreateEditShop() {
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner);
  const { currentCity, currentState, currentAddress } = useSelector(
    (state) => state.user,
  );
  const [name, setName] = useState(myShopData?.name || "");
  const [address, setAddress] = useState(
    myShopData?.address || currentAddress || "",
  );
  const [city, setCity] = useState(myShopData?.city || currentCity || "");
  const [state, setState] = useState(myShopData?.state || currentState || "");
  const [frontendImage, setFrontendImage] = useState(myShopData?.image || null);
  const [backendImage, setBackendImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackendImage(file);
      setFrontendImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !city || !state || !address) {
      alert("All text fields are required");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("address", address);
      if (backendImage) {
        formData.append("image", backendImage);
      }
      const result = await axios.post(
        `${serverUrl}/api/shop/create-edit`,
        formData,
        { withCredentials: true },
      );
      dispatch(setMyShopData(result.data));
      setLoading(false);
      navigate("/");
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-6 bg-gradient-to-br from-[#f4fbf7] via-[#fafdfc] to-[#fffcfb] animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 p-2 rounded-full hover:bg-green-50 text-[#00b252] transition cursor-pointer z-10"
      >
        <IoIosArrowRoundBack size={30} />
      </button>

      {/* Main Container Card */}
      <div className="mt-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-green-900/5 w-full max-w-lg p-8 border border-gray-100/50 hover:shadow-2xl transition-all duration-300">
        {/* Header Block */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-600 flex items-center justify-center shadow-md shadow-green-200 text-white mb-4">
            <FaStore size={28} />
          </div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">
            {myShopData ? "Edit Shop Profile" : "Register New Shop"}
          </h2>
          <p className="text-xs text-gray-500 text-center mt-2 max-w-xs leading-relaxed">
            Provide details about your shop to showcase fresh groceries to
            nearby customers.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Shop Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Shop Name
            </label>
            <input
              type="text"
              placeholder="Enter Shop Name"
              className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/10 rounded-2xl px-4 py-2.5 text-xs outline-none bg-gray-50/50 focus:bg-white transition-all font-semibold text-gray-800"
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
            />
          </div>

          {/* Shop Image */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Shop Cover Image
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/10 rounded-2xl px-4 py-2 text-xs outline-none bg-gray-50/50 focus:bg-white transition-all font-semibold text-gray-800 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-green-50 file:text-[#00b252] file:cursor-pointer hover:file:bg-green-100"
              onChange={handleImage}
            />
            {frontendImage && (
              <div className="mt-3.5 rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-40">
                <img
                  src={frontendImage}
                  alt="Shop Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* City & State Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                City
              </label>
              <input
                type="text"
                placeholder="City Name"
                className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/10 rounded-2xl px-4 py-2.5 text-xs outline-none bg-gray-50/50 focus:bg-white transition-all font-semibold text-gray-800"
                onChange={(e) => setCity(e.target.value)}
                value={city}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                State
              </label>
              <input
                type="text"
                placeholder="State Name"
                className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/10 rounded-2xl px-4 py-2.5 text-xs outline-none bg-gray-50/50 focus:bg-white transition-all font-semibold text-gray-800"
                onChange={(e) => setState(e.target.value)}
                value={state}
                required
              />
            </div>
          </div>

          {/* Full Address */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Store Address
            </label>
            <input
              type="text"
              placeholder="Enter Shop Address"
              className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/10 rounded-2xl px-4 py-2.5 text-xs outline-none bg-gray-50/50 focus:bg-white transition-all font-semibold text-gray-800"
              onChange={(e) => setAddress(e.target.value)}
              value={address}
              required
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00b252] hover:bg-green-600 text-white font-bold py-3 rounded-2xl shadow-md shadow-green-100 hover:shadow-lg transition cursor-pointer active:scale-[0.98] flex items-center justify-center text-xs uppercase tracking-wider"
            >
              {loading ? (
                <ClipLoader size={16} color="white" />
              ) : (
                "Save Profile"
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="mt-10 w-full max-w-5xl">
        <AppFooter />
      </div>
    </div>
  );
}

export default CreateEditShop;
