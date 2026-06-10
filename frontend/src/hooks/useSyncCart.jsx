import axios from 'axios'
import { useEffect } from 'react'
import { serverUrl } from '../App'
import { useSelector } from 'react-redux'

function useSyncCart() {
  const { userData, cartItems, cartInitialized } = useSelector(state => state.user)

  useEffect(() => {
    if (!userData || userData.role !== 'user' || !cartInitialized) {
      return
    }

    const syncCart = async () => {
      try {
        await axios.post(`${serverUrl}/api/cart/sync`, {
          items: cartItems.map(item => ({
            item: item.id,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
            shop: item.shop,
            foodType: item.foodType
          }))
        }, { withCredentials: true })
      } catch (error) {
        console.log(error)
      }
    }

    syncCart()
  }, [userData?._id, cartItems, cartInitialized])
}

export default useSyncCart
