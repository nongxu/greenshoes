// utils/cartUtils.js
import Cookies from 'js-cookie'

export function addToCart(product, quantity = 1) {
  const existingCart = Cookies.get('cart')
  let cart = existingCart ? JSON.parse(existingCart) : []

  const existingItem = cart.find(item => item.id === product.id)

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.push({ ...product, quantity })
  }

  Cookies.set('cart', JSON.stringify(cart), { expires: 7 })
}
