import { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'

const CartContext = createContext()

const initialState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  isOpen: false
}

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload.items,
        totalItems: action.payload.totalItems,
        totalAmount: action.payload.totalAmount
      }
    
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        )
        
        const newState = {
          ...state,
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalAmount: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        }
        
        localStorage.setItem('cart', JSON.stringify(newState))
        return newState
      } else {
        const updatedItems = [...state.items, action.payload]
        
        const newState = {
          ...state,
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalAmount: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        }
        
        localStorage.setItem('cart', JSON.stringify(newState))
        return newState
      }
    }
    
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.id !== action.payload)
      
      const newState = {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
      
      localStorage.setItem('cart', JSON.stringify(newState))
      return newState
    }
    
    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0)
      
      const newState = {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
      
      localStorage.setItem('cart', JSON.stringify(newState))
      return newState
    }
    
    case 'CLEAR_CART': {
      const newState = {
        ...state,
        items: [],
        totalItems: 0,
        totalAmount: 0
      }
      
      localStorage.setItem('cart', JSON.stringify(newState))
      return newState
    }
    
    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen
      }
    
    case 'CLOSE_CART':
      return {
        ...state,
        isOpen: false
      }
    
    default:
      return state
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart)
        dispatch({
          type: 'LOAD_CART',
          payload: cartData
        })
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  const addToCart = (product, quantity = 1) => {
    const cartItem = {
      id: product._id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.images[0]?.url || '',
      quantity,
      stock: product.stock
    }

    dispatch({
      type: 'ADD_ITEM',
      payload: cartItem
    })

    toast.success(`${product.name} added to cart!`)
  }

  const removeFromCart = (productId) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: productId
    })

    toast.success('Item removed from cart')
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id: productId, quantity }
    })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
    toast.success('Cart cleared')
  }

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' })
  }

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' })
  }

  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.id === productId)
    return item ? item.quantity : 0
  }

  const isInCart = (productId) => {
    return state.items.some(item => item.id === productId)
  }

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    closeCart,
    getItemQuantity,
    isInCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}