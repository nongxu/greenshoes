// utils/cartUtils.js
import Cookies from 'js-cookie'

export function addToCart(item, qty=1) {
  const existing = Cookies.get('cart');
  let cart = existing ? JSON.parse(existing) : [];
  // match by product+variant
  const idx = cart.findIndex(i => 
    i.productId===item.productId && i.variantId===item.variantId
  );
  if (idx > -1) {
    cart[idx].quantity += qty;
  } else {
    cart.push({ ...item, quantity: qty });
  }
  Cookies.set('cart', JSON.stringify(cart), { expires:7 });
}
