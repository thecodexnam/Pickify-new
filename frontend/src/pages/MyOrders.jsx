import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import UserOrderCard from '../components/UserOrderCard';
import OwnerOrderCard from '../components/OwnerOrderCard';
import { setMyOrders, updateRealtimeOrderStatus } from '../redux/userSlice';
import { FaBoxesStacked } from "react-icons/fa6";
import Nav from '../components/Nav';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import AppFooter from '../components/AppFooter';

function MyOrders() {
  const { userData, myOrders, socket } = useSelector(state => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!socket) return

    socket.on('newOrder', (data) => {
      if (data.shopOrders?.owner?._id === userData._id || data.shopOrders?.owner === userData._id) {
        dispatch(setMyOrders([data, ...myOrders]))
      }
    })

    socket.on('update-status', ({ orderId, shopId, status, userId }) => {
      if (userId === userData._id) {
        dispatch(updateRealtimeOrderStatus({ orderId, shopId, status }))
      }
    })

    return () => {
      socket.off('newOrder')
      socket.off('update-status')
    }
  }, [socket, myOrders, userData])

  return (
    <div className="page-shell animate-fade-in">
      <Nav />

      <div className="page-content max-w-[800px]">
        <PageHeader
          eyebrow="Orders"
          title="Order history"
          subtitle={`${myOrders?.length || 0} ${myOrders?.length === 1 ? 'order' : 'orders'} tracked`}
          onBack={() => navigate('/')}
        />

        {!myOrders || myOrders.length === 0 ? (
          <div className="surface-card">
            <EmptyState
              icon={<FaBoxesStacked size={32} />}
              title="No orders yet"
              description="You haven't placed or received any grocery orders yet. Explore local stores and start shopping."
              action={
                <button onClick={() => navigate('/')} className="primary-btn px-6 py-3 text-sm">
                  Start shopping
                </button>
              }
            />
          </div>
        ) : (
          <div className="space-y-5">
            {myOrders.map((order) => (
              userData.role === "user" ? (
                <UserOrderCard data={order} key={order._id} />
              ) : userData.role === "owner" ? (
                <OwnerOrderCard data={order} key={order._id} />
              ) : null
            ))}
          </div>
        )}
      </div>
      <div className="page-content max-w-[800px] pb-10">
        <AppFooter />
      </div>
    </div>
  )
}

export default MyOrders
