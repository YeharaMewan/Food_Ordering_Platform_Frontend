import { Order } from "@/types";

export const calculateOrderTotal = (order: Order): number => {
  let totalAmount = 0;

  // Calculate total from cart items
  if (order.cartItems && Array.isArray(order.cartItems)) {
    order.cartItems.forEach((cartItem) => {
      // Find the menu item in the restaurant
      const menuItem = order.restaurant?.menuItems?.find(
        (item) => item._id.toString() === cartItem.menuItemId.toString()
      );

      if (menuItem && cartItem.quantity) {
        const quantity = parseInt(cartItem.quantity);
        if (!isNaN(quantity)) {
          totalAmount += menuItem.price * quantity;
        }
      }
    });
  }

  // Add delivery price if available
  if (order.restaurant?.deliveryPrice) {
    totalAmount += order.restaurant.deliveryPrice;
  }

  return totalAmount;
};

export const getOrderTotalAmount = (order: Order): number => {
  // If totalAmount exists and is valid, use it
  if (order.totalAmount != null && !isNaN(order.totalAmount)) {
    return order.totalAmount;
  }

  // Otherwise, calculate it client-side
  return calculateOrderTotal(order);
};

export const formatOrderTotal = (order: Order): string => {
  const total = getOrderTotalAmount(order);
  
  if (total > 0) {
    return `$${(total / 100).toFixed(2)}`;
  }
  
  return "Calculating...";
};