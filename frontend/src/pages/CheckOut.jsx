import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoSearchOutline, IoLocationSharp } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import "leaflet/dist/leaflet.css";
import { setAddress, setLocation } from "../redux/mapSlice";
import { MdDeliveryDining, MdOutlinePayment } from "react-icons/md";
import { FaCreditCard, FaReceipt } from "react-icons/fa";
import axios from "axios";
import { FaMobileScreenButton, FaArrowRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { addMyOrder, clearCartState } from "../redux/userSlice";
import PageHeader from "../components/PageHeader";
import Nav from "../components/Nav";
import PickupDistanceInfo from "../components/PickupDistanceInfo";
import AppFooter from "../components/AppFooter";

function RecenterMap({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location?.lat && location?.lon) {
      map.setView([location.lat, location.lon], 16, { animate: true });
    }
  }, [location?.lat, location?.lon, map]);

  return null;
}

function CheckOut() {
  const { location, address } = useSelector((state) => state.map);
  const { cartItems, totalAmount, userData } = useSelector(
    (state) => state.user,
  );
  const [addressInput, setAddressInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [placingOrder, setPlacingOrder] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEOAPIKEY;
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID?.trim();
  const isPickup = deliveryMethod === "pickup";
  const deliveryFee = totalAmount > 500 ? 0 : 40;
  const orderTotal = isPickup ? totalAmount : totalAmount + deliveryFee;

  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng;
    dispatch(setLocation({ lat, lon: lng }));
    getAddressByLatLng(lat, lng);
  };

  const getCurrentLocation = () => {
    const latitude = userData.location.coordinates[1];
    const longitude = userData.location.coordinates[0];
    dispatch(setLocation({ lat: latitude, lon: longitude }));
    getAddressByLatLng(latitude, longitude);
  };

  const getAddressByLatLng = async (lat, lng) => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`,
      );
      dispatch(setAddress(result?.data?.results[0].address_line2));
    } catch (error) {
      console.log(error);
    }
  };

  const getLatLngByAddress = async () => {
    if (!addressInput) return;
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`,
      );
      if (result.data.features && result.data.features.length > 0) {
        const { lat, lon } = result.data.features[0].properties;
        dispatch(setLocation({ lat, lon }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === "online" && !razorpayKeyId) {
      alert(
        "Online payment is not configured. Add VITE_RAZORPAY_KEY_ID to the frontend .env file.",
      );
      return;
    }

    if (!isPickup && (!addressInput || !location?.lat || !location?.lon)) {
      alert("Please set a valid delivery address before placing the order.");
      return;
    }

    setPlacingOrder(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/place-order`,
        {
          paymentMethod,
          deliveryMethod,
          deliveryAddress: isPickup
            ? {
                text: "Self Pickup at Store",
                latitude: null,
                longitude: null,
              }
            : {
                text: addressInput,
                latitude: location.lat,
                longitude: location.lon,
              },
          totalAmount: orderTotal,
          cartItems,
        },
        { withCredentials: true },
      );

      if (paymentMethod === "cod") {
        dispatch(addMyOrder(result.data));
        dispatch(clearCartState());
        navigate("/order-placed");
      } else {
        const orderId = result.data.orderId;
        const razorOrder = result.data.razorOrder;
        if (!orderId || !razorOrder?.id) {
          throw new Error("Could not start Razorpay checkout for this order.");
        }
        openRazorpayWindow(orderId, razorOrder);
      }
    } catch (error) {
      console.log(error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to place the order right now.",
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  const openRazorpayWindow = (orderId, razorOrder) => {
    if (typeof window === "undefined" || !window.Razorpay) {
      console.error(
        "Razorpay checkout script is not available in this browser.",
      );
      alert(
        "Online payment is currently unavailable in this browser. Please try again in Chrome or disable any browser extensions blocking Razorpay.",
      );
      return;
    }

    if (!razorpayKeyId) {
      alert(
        "Razorpay key is missing. Add VITE_RAZORPAY_KEY_ID to frontend/.env and restart the dev server.",
      );
      return;
    }

    const options = {
      key: razorpayKeyId,
      amount: razorOrder.amount,
      currency: razorOrder.currency || "INR",
      name: "Pickify",
      description: "Grocery order payment",
      order_id: razorOrder.id,
      prefill: {
        name: userData?.fullName || "",
        email: userData?.email || "",
        contact: userData?.mobile || "",
      },
      theme: {
        color: "#00b252",
      },
      handler: async function (response) {
        try {
          const result = await axios.post(
            `${serverUrl}/api/order/verify-payment`,
            {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            },
            { withCredentials: true },
          );
          dispatch(addMyOrder(result.data));
          dispatch(clearCartState());
          navigate("/order-placed");
        } catch (error) {
          console.log(error);
          alert(
            error?.response?.data?.message || "Payment verification failed.",
          );
        }
      },
      modal: {
        ondismiss: function () {
          alert(
            "Payment was cancelled. Your order is saved as unpaid — you can retry from My Orders or checkout again.",
          );
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        alert(
          response.error?.description || "Payment failed. Please try again.",
        );
      });
      rzp.open();
    } catch (error) {
      console.error("Failed to open Razorpay window", error);
      alert(
        "Unable to open the payment window. Please refresh the page and try again.",
      );
    }
  };

  useEffect(() => {
    setAddressInput(address);
  }, [address]);

  return (
    <div className="page-shell animate-fade-in">
      <Nav />

      <div className="page-content max-w-[900px]">
        <PageHeader
          eyebrow="Checkout"
          title="Finish your order"
          subtitle="Choose where to deliver and how you want to pay."
          onBack={() => navigate("/cart")}
        />

        <div className="surface-card p-6 sm:p-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900">
              <IoLocationSharp className="text-emerald-700" />
              Fulfillment mode
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div
                onClick={() => setDeliveryMethod("delivery")}
                className={`cursor-pointer rounded-[1.4rem] border p-4 transition ${deliveryMethod === "delivery" ? "border-emerald-400 bg-emerald-50/40" : "border-slate-200 bg-white"}`}
              >
                <p className="text-sm font-black text-slate-900">
                  Doorstep delivery
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Get your groceries delivered straight to your address.
                </p>
              </div>

              <div
                onClick={() => setDeliveryMethod("pickup")}
                className={`cursor-pointer rounded-[1.4rem] border p-4 transition ${deliveryMethod === "pickup" ? "border-emerald-400 bg-emerald-50/40" : "border-slate-200 bg-white"}`}
              >
                <p className="text-sm font-black text-slate-900">Self pickup</p>
                <p className="mt-1 text-xs text-slate-500">
                  Collect your order from the store when it is ready.
                </p>
              </div>
            </div>

            {isPickup ? (
              <PickupDistanceInfo
                cartItems={cartItems}
                userData={userData}
                mapLocation={location}
              />
            ) : (
              <>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder="Enter your delivery address"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:bg-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={getLatLngByAddress}
                      className="primary-btn px-4 py-3"
                    >
                      <IoSearchOutline size={16} />
                    </button>
                    <button
                      onClick={getCurrentLocation}
                      className="secondary-btn px-4 py-3"
                    >
                      <TbCurrentLocation size={16} />
                    </button>
                  </div>
                </div>

                <div className="h-64 overflow-hidden rounded-[1.4rem] border border-slate-100">
                  <MapContainer
                    className="h-full w-full"
                    center={[location?.lat || 28.6139, location?.lon || 77.209]}
                    zoom={16}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <RecenterMap location={location} />
                    <Marker
                      position={[
                        location?.lat || 28.6139,
                        location?.lon || 77.209,
                      ]}
                      draggable
                      eventHandlers={{ dragend: onDragEnd }}
                    />
                  </MapContainer>
                </div>
              </>
            )}
          </section>

          <section className="mt-8 space-y-4">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900">
              <MdOutlinePayment className="text-emerald-700" />
              Payment method
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div
                onClick={() => setPaymentMethod("cod")}
                className={`cursor-pointer rounded-[1.4rem] border p-4 transition ${paymentMethod === "cod" ? "border-emerald-400 bg-emerald-50/40" : "border-slate-200 bg-white"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-emerald-50 p-3 text-emerald-700">
                    <MdDeliveryDining size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      Cash on delivery
                    </p>
                    <p className="text-xs text-slate-500">
                      Pay when groceries arrive at your doorstep.
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod("online")}
                className={`cursor-pointer rounded-[1.4rem] border p-4 transition ${paymentMethod === "online" ? "border-emerald-400 bg-emerald-50/40" : "border-slate-200 bg-white"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="rounded-full bg-violet-50 p-3 text-violet-700">
                      <FaMobileScreenButton size={14} />
                    </div>
                    <div className="rounded-full bg-sky-50 p-3 text-sky-700">
                      <FaCreditCard size={14} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      UPI / Cards / NetBanking
                    </p>
                    <p className="text-xs text-slate-500">
                      Secure online payment with Razorpay.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 space-y-4">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900">
              <FaReceipt className="text-emerald-700" />
              Order summary
            </div>

            <div className="rounded-[1.4rem] border border-slate-100 bg-slate-50/70 p-5">
              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm text-slate-600"
                  >
                    <span>
                      {item.name}{" "}
                      <span className="text-slate-400">× {item.quantity}</span>
                    </span>
                    <span className="font-black text-slate-900">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Basket subtotal</span>
                  <span className="font-black text-slate-900">
                    ₹{totalAmount}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-slate-500">
                    {isPickup ? "Pickup fee" : "Delivery fee"}
                  </span>
                  <span className="font-black text-slate-900">
                    {isPickup
                      ? "Free"
                      : deliveryFee === 0
                        ? "Free"
                        : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="text-base font-black text-slate-900">
                    Total
                  </span>
                  <span className="text-xl font-black text-emerald-700">
                    ₹{orderTotal}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <button
            onClick={handlePlaceOrder}
            disabled={placingOrder}
            className="primary-btn mt-8 w-full py-3.5 text-sm"
          >
            {placingOrder
              ? "Processing…"
              : paymentMethod === "cod"
                ? "Place order"
                : "Pay & place order"}
            {!placingOrder && <FaArrowRight size={14} />}
          </button>
        </div>
      </div>
      <div className="page-content max-w-[900px] pb-10">
        <AppFooter />
      </div>
    </div>
  );
}

export default CheckOut;
