import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'hdw-cart';

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find((i) => i.id === action.product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.product.id ? { ...i, quantity: i.quantity + (action.qty || 1) } : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.product, quantity: action.qty || 1 }],
      };
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, quantity: Math.max(1, action.qty) } : i
        ),
      };
    case 'CLEAR':
      return { ...state, items: [] };
    case 'TOGGLE_IMAGINE': {
      const inBoard = state.imagineBoard.find((i) => i.id === action.product.id);
      if (inBoard) {
        return { ...state, imagineBoard: state.imagineBoard.filter((i) => i.id !== action.product.id) };
      }
      if (state.imagineBoard.length >= 6) return state;
      return { ...state, imagineBoard: [...state.imagineBoard, action.product] };
    };
    case 'CLEAR_IMAGINE':
      return { ...state, imagineBoard: [] };
    default:
      return state;
  }
}

const initialState = { items: [], imagineBoard: [] };

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialState;
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const cartCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ ...state, dispatch, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
