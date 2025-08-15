import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { WhatsAppOrderButton } from '@/components/WhatsAppOrderButton';
import { useToast } from '@/hooks/use-toast';

export default function Cart() {
  const navigate = useNavigate();
  const { items, totalPrice, updateQuantity, removeFromCart, loading } = useCart();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const isFormValid = customerInfo.name && customerInfo.email && customerInfo.phone && customerInfo.address;

  const handleGoBack = () => {
    navigate(-1);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="mb-6"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            العودة
          </Button>
          
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">السلة فارغة</h1>
            <p className="text-muted-foreground mb-6">لا توجد منتجات في سلة المشتريات</p>
            <Button onClick={() => navigate('/')}>
              تسوق الآن
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="mb-6"
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          العودة
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Cart Items */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">سلة المشتريات</h1>
            
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product.name}</h3>
                        <p className="text-primary font-bold">
                          {item.product.price.toFixed(2)} أوقية
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                            disabled={loading}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="w-8 text-center">{item.quantity}</span>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                            disabled={loading}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.product_id)}
                            disabled={loading}
                            className="mr-auto text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>المجموع الكلي:</span>
                  <span className="text-primary">{totalPrice.toFixed(2)} أوقية</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>معلومات التوصيل</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="space-y-4">
                   <div>
                     <Label htmlFor="name">الاسم الكامل *</Label>
                     <Input
                       id="name"
                       value={customerInfo.name}
                       onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                     />
                   </div>
                   
                   <div>
                     <Label htmlFor="email">البريد الإلكتروني *</Label>
                     <Input
                       id="email"
                       type="email"
                       value={customerInfo.email}
                       onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                     />
                   </div>
                   
                   <div>
                     <Label htmlFor="phone">رقم الهاتف *</Label>
                     <Input
                       id="phone"
                       type="tel"
                       value={customerInfo.phone}
                       onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                     />
                   </div>
                   
                   <div>
                     <Label htmlFor="address">عنوان التوصيل *</Label>
                     <Textarea
                       id="address"
                       value={customerInfo.address}
                       onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                       rows={3}
                     />
                   </div>
                   
                   <div>
                     <Label htmlFor="notes">ملاحظات إضافية</Label>
                     <Textarea
                       id="notes"
                       value={customerInfo.notes}
                       onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                       rows={2}
                     />
                   </div>
                   
                   <WhatsAppOrderButton
                     orderData={{
                       customerName: customerInfo.name,
                       customerPhone: customerInfo.phone,
                       customerEmail: customerInfo.email,
                       customerAddress: customerInfo.address,
                       notes: customerInfo.notes
                     }}
                     disabled={!isFormValid || loading}
                   />
                 </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
