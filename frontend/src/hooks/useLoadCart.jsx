import axios from 'axios'
import { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setCartItems } from '../redux/userSlice'

function useLoadCart() {
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.user)

  useEffect(() => {
    if (!userData || userData.role !== 'user') {
      return
    }

    const fetchCart = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/cart/my`, { withCredentials: true })
        const items = (result.data?.items || []).map(line => ({
          id: line.item?._id || line.item,
          name: line.name,
          image: line.image,
          price: line.price,
          quantity: line.quantity,
          shop: line.shop,
          foodType: line.foodType
        }))
        dispatch(setCartItems(items))
      } catch (error) {
        console.log(error)
      }
    }

    fetchCart()
  }, [userData?._id])
}

export default useLoadCart
