import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { FaCartPlus, FaPlusCircle, FaMinusCircle, FaTrashAlt, FaSpinner } from "react-icons/fa";

const Pharmacy = () => {
  const { BACKEND_URL, token } = useContext(AppContext);

  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Delivery form states
  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    const fetchMedicines = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${BACKEND_URL}/api/pharmacy/all-medicines`);
        if (response.data.success) {
          setMedicines(response.data.data);
          setFilteredMedicines(response.data.data);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load medicines");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMedicines();
  }, [BACKEND_URL]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMedicines(medicines);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      setFilteredMedicines(
        medicines.filter(
          (med) =>
            med.name.toLowerCase().includes(lowerSearch) ||
            med.brand.toLowerCase().includes(lowerSearch)
        )
      );
    }
  }, [searchTerm, medicines]);

  const addToCart = (medicine) => {
    setCart((prevCart) => {
      const prev = prevCart[medicine._id];
      const quantity = prev ? prev.quantity + 1 : 1;
      return {
        ...prevCart,
        [medicine._id]: { medicine, quantity },
      };
    });
    toast.success(`Added ${medicine.name} to cart`);
  };

  const removeFromCart = (medicineId) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      delete newCart[medicineId];
      return newCart;
    });
  };

  const updateQuantity = (medicineId, newQty) => {
    if (newQty < 1) return;
    setCart((prevCart) => ({
      ...prevCart,
      [medicineId]: { ...prevCart[medicineId], quantity: newQty },
    }));
  };

  const totalPrice = Object.values(cart).reduce(
    (acc, { medicine, quantity }) => acc + medicine.price * quantity,
    0
  );

  // Payment processing function
  const processPayment = async () => {
    if (!deliveryAddress.trim() || !phoneNumber.trim()) {
      toast.error("Please fill in all delivery details");
      return;
    }

    if (!token) {
      toast.error("Please login to continue");
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Prepare medicines data for backend
      const medicinesData = Object.values(cart).map(({ medicine, quantity }) => ({
        medicineId: medicine._id,
        quantity
      }));

      const orderResponse = await axios.post(
        `${BACKEND_URL}/api/orders/medicine-payment`,
        {
          medicines: medicinesData,
          deliveryAddress,
          phoneNumber
        },
        {
          headers: { 'token': token },
        }
      );

      if (!orderResponse.data.success) {
        toast.error(orderResponse.data.message);
        return;
      }

      const { razorpayOrder, orderId } = orderResponse.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Medical Pharmacy",
        description: "Medicine Purchase",
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            const verifyResponse = await axios.post(
              `${BACKEND_URL}/api/orders/verify-payment-medicine`,
              {
                orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              },
              {
                headers: { 'token': token },
              }
            );

            if (verifyResponse.data.success) {
              toast.success("Payment successful! Order confirmed.");
              setCart({});
              setShowCheckout(false);
              setDeliveryAddress("");
              setPhoneNumber("");
            } else {
              toast.error("Payment verification failed");
            }
          } catch (error) {
            toast.error("Payment verification error");
            console.error("Payment verification error:", error);
          }
        },
        prefill: {
          contact: phoneNumber
        },
        theme: {
          color: "#2563eb"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on('payment.failed', (response) => {
        toast.error("Payment failed. Please try again.");
        console.error("Payment failed:", response);
      });

    } catch (error) {
      toast.error(error.response?.data?.message || "Payment processing failed");
      console.error("Payment processing error:", error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 font-sans max-w-7xl mx-auto">
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Browse Medicines</h1>
      </header>

      <div className="mb-8 max-w-sm">
        <input
          type="search"
          placeholder="Search by name or brand..."
          className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search medicines"
        />
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medicines List */}
        <section className="lg:col-span-2">
          {isLoading ? (
            <p className="text-center text-gray-600 py-20">Loading medicines...</p>
          ) : filteredMedicines.length === 0 ? (
            <p className="text-center text-gray-600 py-20">No medicines found.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredMedicines.map((med) => (
                <li
                  key={med._id}
                  className="bg-white rounded-lg shadow p-5 flex flex-col shadow-gray-200 hover:shadow-lg transition"
                >
                  <img
                    src={med.image}
                    alt={med.name}
                    className="w-full h-40 object-contain mb-4 rounded"
                    loading="lazy"
                  />
                  <h2 className="font-semibold text-lg capitalize text-gray-900 truncate" title={med.name}>{med.name}</h2>
                  <p className="text-sm text-gray-700 mb-1 truncate" title={med.brand}>
                    Brand: <span className="font-medium">{med.brand}</span>
                  </p>
                  <p className="text-sm text-gray-700 mb-1">Dose: {med.dose}</p>
                  <p className="text-base font-bold text-green-600 mb-3">₹{med.price}</p>
                  <button
                    onClick={() => addToCart(med)}
                    disabled={med.stock === 0}
                    className={`mt-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition flex items-center justify-center gap-2 ${
                      med.stock === 0 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    aria-label={`Add ${med.name} to cart`}
                    title={med.stock === 0 ? "Out of stock" : undefined}
                  >
                    <FaCartPlus /> Add to Cart
                  </button>
                  {med.stock === 0 && (
                    <p className="mt-2 text-xs text-red-600 font-semibold">Out of stock</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Cart Section */}
        <section className="bg-white rounded-lg shadow p-6 sticky top-6 h-fit max-h-[80vh] flex flex-col">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900">
            <FaCartPlus /> Your Cart
          </h2>
          
          {Object.keys(cart).length === 0 ? (
            <p className="text-gray-600 flex-grow flex items-center justify-center py-8">
              Your cart is empty.
            </p>
          ) : (
            <>
              <ul className="divide-y divide-gray-200 overflow-y-auto flex-grow max-h-60">
                {Object.values(cart).map(({ medicine, quantity }) => (
                  <li key={medicine._id} className="flex items-center py-3 gap-4">
                    <img
                      src={medicine.image}
                      alt={medicine.name}
                      className="w-14 h-14 object-contain rounded shadow-sm"
                      loading="lazy"
                    />
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold truncate" title={medicine.name}>{medicine.name}</p>
                      <p className="text-sm text-gray-600">₹{medicine.price} each</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(medicine._id, quantity - 1)}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                        disabled={quantity <= 1}
                      >
                        <FaMinusCircle size={20} />
                      </button>
                      <span className="font-semibold w-6 text-center">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(medicine._id, quantity + 1)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaPlusCircle size={20} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(medicine._id)}
                      className="text-red-600 hover:text-red-800 ml-4"
                    >
                      <FaTrashAlt />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-6 border-t border-gray-200 pt-4">
                <p className="text-lg font-bold text-gray-900 mb-4">
                  Total: ₹{totalPrice.toFixed(2)}
                </p>

                {!showCheckout ? (
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition font-semibold"
                  >
                    Proceed to Checkout
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Address
                      </label>
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter your complete delivery address"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter your phone number"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCheckout(false)}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-md transition"
                      >
                        Back
                      </button>
                      <button
                        onClick={processPayment}
                        disabled={isProcessingPayment || !deliveryAddress.trim() || !phoneNumber.trim()}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-md transition font-semibold flex items-center justify-center gap-2"
                      >
                        {isProcessingPayment ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Pay Now'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default Pharmacy;
