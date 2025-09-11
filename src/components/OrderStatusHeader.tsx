import { Order } from "@/types";
import { Progress } from "./ui/progress";
import { ORDER_STATUS } from "@/config/order-status-config";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Trash } from "lucide-react";
import { useDeleteOrder } from "@/api/OrderApi";
import { useQueryClient } from "react-query";
import { toast } from "sonner";
import { useState } from "react";

type Props = {
  order: Order;
};

const OrderStatusHeader = ({ order }: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { deleteOrder, isLoading } = useDeleteOrder();
  const queryClient = useQueryClient();

  const getExpectedDelivery = () => {
    const created = new Date(order.createdAt);

    created.setMinutes(
      created.getMinutes() + order.restaurant.estimatedDeliveryTime
    );

    const hours = created.getHours();
    const minutes = created.getMinutes();

    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${hours}:${paddedMinutes}`;
  };

  const getOrderStatusInfo = () => {
    return (
      ORDER_STATUS.find((o) => o.value === order.status) || ORDER_STATUS[0]
    );
  };

  const handleDeleteOrder = async () => {
    try {
      await deleteOrder(order._id);
      toast.success("Order deleted successfully");
      queryClient.invalidateQueries("fetchMyOrders");
      queryClient.invalidateQueries("fetchMyRestaurantOrders");
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete order");
    }
  };

  const canDeleteOrder = order.status !== "inProgress";

  return (
    <>
      <div className="flex flex-col gap-5 md:flex-row md:justify-between md:items-start">
        <h1 className="text-4xl font-bold tracking-tighter">
          <div className="flex flex-col gap-5 md:flex-row md:justify-between">
            <span>Order Status: {getOrderStatusInfo().label}</span>
            <span>Expected by: {getExpectedDelivery()}</span>
          </div>
        </h1>
        {canDeleteOrder && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash className="w-4 h-4 mr-2" />
                Delete Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Order</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this order? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteOrder}
                  disabled={isLoading}
                >
                  {isLoading ? "Deleting..." : "Delete Order"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <Progress
        className="animate-pulse"
        value={getOrderStatusInfo().progressValue}
      />
    </>
  );
};

export default OrderStatusHeader;
