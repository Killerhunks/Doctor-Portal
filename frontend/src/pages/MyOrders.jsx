import React, {useContext, useEffect, useState} from 'react'
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const MyOrders = () => {
    const {token, BACKEND_URL} = useContext(AppContext);
    const [orderData, setOrderData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchUserOrders = async() => {
        setLoading(true);
        try {
            const response = await axios.get(`${BACKEND_URL}/api/orders/user-orders`, {
                headers: {'token': token}
            });
            if(response.data.success) {
                console.log(response.data.data);
                setOrderData(response.data.data);
            }
            else {
                console.log(response.data);
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch user orders');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUserOrders();
    }, [])

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'delivered': return 'bg-blue-100 text-blue-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-gray-600 mt-2">Track your medicine orders</p>
                </div>

                {/* Orders List */}
                {orderData.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-600">You haven't placed any orders yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orderData.map((order) => (
                            <div key={order._id} className="bg-white rounded-lg shadow p-4">
                                {/* Order Header */}
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            #{order._id?.slice(-8) || 'N/A'}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                        <p className="text-lg font-bold text-green-600 mt-1">
                                            ₹{order.totalAmount?.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {/* Medicines List - Compact */}
                                <div className="border-t pt-3">
                                    <p className="text-sm font-medium text-gray-700 mb-2">
                                        {order.medicines?.length} Medicine(s)
                                    </p>
                                    <div className="space-y-2">
                                        {order.medicines?.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center text-sm bg-gray-50 rounded p-2">
                                                <span className="font-medium capitalize text-gray-800">
                                                    {item.name}
                                                </span>
                                                <div className="flex items-center gap-3 text-gray-600">
                                                    <span>Qty: {item.quantity}</span>
                                                    <span className="font-semibold text-gray-800">
                                                        ₹{item.subtotal?.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Delivery Address - Simplified */}
                                <div className="mt-3 pt-3 border-t">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Delivery:</span> {order.deliveryAddress?.substring(0, 60)}...
                                    </p>
                                    {order.phoneNumber && (
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Phone:</span> {order.phoneNumber}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyOrders;
