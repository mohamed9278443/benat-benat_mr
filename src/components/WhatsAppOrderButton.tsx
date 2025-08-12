import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface OrderFormData {
  customerName: string;
  customerPhone: string;
  customerCity: string;
  notes: string;
}

interface WhatsAppOrderButtonProps {
  orderData: OrderFormData;
  disabled?: boolean;
}

export const WhatsAppOrderButton: React.FC<WhatsAppOrderButtonProps> = ({ 
  orderData, 
  disabled = false 
}) => {
  const { items, totalPrice } = useCart();
  const { settings } = useSiteSettings();

  const generateWhatsAppMessage = () => {
    let message = `مرحباً، أود طلب المنتجات التالية:\n\n`;
    
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name}\n`;
      message += `   الكمية: ${item.quantity}\n`;
      message += `   السعر: ${item.product.price.toFixed(2)} أوقية\n`;
      message += `   الرابط: ${window.location.origin}/product/${item.product_id}\n\n`;
    });
    
    message += `المبلغ الإجمالي: ${totalPrice.toFixed(2)} أوقية\n\n`;
    
    message += `معلومات العميل:\n`;
    message += `الاسم: ${orderData.customerName}\n`;
    message += `رقم الهاتف: ${orderData.customerPhone}\n`;
    message += `المدينة: ${orderData.customerCity}\n`;
    
    if (orderData.notes) {
      message += `ملاحظات إضافية: ${orderData.notes}\n`;
    }
    
    return encodeURIComponent(message);
  };

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const whatsappNumber = "22249055137";
    
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    
    window.location.href = whatsappUrl;
  };

  return (
    <Button
      type="button"
      onClick={handleWhatsAppOrder}
      disabled={disabled || items.length === 0}
      className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
      size="lg"
    >
      <MessageCircle className="h-5 w-5" />
      إرسال الطلب عبر واتساب
    </Button>
  );
};
