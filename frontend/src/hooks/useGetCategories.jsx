import axios from 'axios'
import { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setCategories } from '../redux/userSlice'

function useGetCategories() {
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.user)

  useEffect(() => {
    if (!userData) {
      return
    }

    const fetchCategories = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/category`, { withCredentials: true })
        dispatch(setCategories(result.data))
      } catch (error) {
        console.log(error)
      }
    }

    fetchCategories()
  }, [userData?._id])
}

export default useGetCategories
